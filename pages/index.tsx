
import { Inter } from 'next/font/google'
import {useEffect, useState} from "react";
import {ColumnsType} from "antd/es/table";
import {Button, Form, Input, InputNumber, message, Modal, Space, Table, Tag, Select, Descriptions} from "antd";
// import { faker } from '@faker-js/faker'; // Remove faker for smart inventory system as autofill is not used
import {Inventory} from ".prisma/client";
const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [items, setItems] = useState<Inventory[]>([]);
  const [filteredItems, setFilteredItems] = useState<Inventory[]>([]);
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchItems = async () => {
    const res = await fetch("/api/inventory", { method: "GET" });
    const data = await res.json();
    setItems(data);
    setFilteredItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const showModal = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // Referenced Material: https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation
  const handleEdit = (event: MouseEvent, item: Inventory) => {
    event.stopPropagation(); // Prevent item details modal from opening when editing a selected item
    setEditingItem(item);
    form.setFieldsValue(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (event: MouseEvent, id: number) => {
    event.stopPropagation(); // Prevent item details modal from opening after deleting a selected item
    const res = await fetch(`/api/inventory?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      message.success("Item deleted");
      fetchItems();
    } else {
      message.error("Failed to delete item");
    }
  };

  const handleSearch = (value: string) => {
    const filtered = items.filter(
      (item) =>
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(value.toLowerCase()))
    );
    setFilteredItems(filtered);
  };

  const handleCategoryFilter = (value: string | undefined) => {
    if (!value) {
      setFilteredItems(items);
      return;
    }

    const filtered = items.filter((item) => item.category === value);
    setFilteredItems(filtered);
  };

  const onFinish = async (values: any) => {
    const url = editingItem ? `/api/inventory?id=${editingItem.id}` : "/api/inventory";
    const method = editingItem ? "PUT" : "POST";

    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        unitPrice: parseFloat(values.unitPrice),
        quantityInStock: parseInt(values.quantityInStock),
        reorderLevel: parseInt(values.reorderLevel),
        reorderTimeInDays: parseInt(values.reorderTimeInDays),
        quantityInReorder: parseInt(values.quantityInReorder)
      })
    });

    if (res.ok) {
      const updated = await res.json();
      const newData = editingItem
        ? items.map((i) => (i.id === updated.id ? updated : i))
        : [...items, updated];

      setItems(newData);
      setFilteredItems(newData);

      message.success(editingItem ? "Item updated" : "Item added");
      form.resetFields();
      setIsModalOpen(false);
    } else {
      message.error("Failed to save item");
    }
  };

  const columns: ColumnsType<Inventory> = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (value: number) => `$${value.toFixed(2)}`
    },
    {
      title: "Stock",
      dataIndex: "quantityInStock",
      key: "quantityInStock",
      render: (stock: number, record) =>
        stock < record.reorderLevel ? (
          <Tag color="red">{stock} (Low)</Tag>
        ) : (
          <span>{stock}</span>
        )
    },
    { title: "Reorder Level", dataIndex: "reorderLevel", key: "reorderLevel" },
    { title: "Reorder Time (Days)", dataIndex: "reorderTimeInDays", key: "reorderTimeInDays" },
    { title: "Quantity in Reorder", dataIndex: "quantityInReorder", key: "quantityInReorder" },
    { title: "Category", dataIndex: "category", key: "category" },
    {
      title: "Last Updated",
      dataIndex: "lastUpdated",
      key: "lastUpdated",
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={(event) => handleEdit(event, record)}>Edit</Button>
          <Button type="link" danger onClick={(event) => handleDelete(event, record.id)}>Delete</Button>
        </Space>
      )
    }
  ];

  return (
    <>
      <Button type="primary" onClick={showModal}>Add Item</Button>

      {/* Modal for adding a new item to the inventory system or editing an existing item*/}
      <Modal
        title={editingItem ? "Edit Item" : "Add New Item"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
          <Form.Item name="unitPrice" label="Unit Price" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="quantityInStock" label="Quantity in Stock" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="reorderLevel" label="Reorder Level" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="reorderTimeInDays" label="Reorder Time (days)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="quantityInReorder" label="Quantity in Reorder">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Select placeholder="Select a category">
              <Select.Option value="Electronics">Electronics</Select.Option>
              <Select.Option value="Groceries">Groceries</Select.Option>
              <Select.Option value="Office Supplies">Office Supplies</Select.Option>
              <Select.Option value="Outdoors">Outdoors</Select.Option>
              <Select.Option value="Home & Kitchen">Home & Kitchen</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              {editingItem ? "Update" : "Submit"}
            </Button>
            <Button onClick={() => { setIsModalOpen(false); form.resetFields(); }}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Search and Category filtering functionalities for Smart Inventory */}
      <div style={{ display: "flex", marginTop: 16, marginBottom: 8 }}>
        <Input.Search
          placeholder="Search by name or description"
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
        />

        <Select
          placeholder="Filter by Category"
          allowClear
          onChange={(value) => handleCategoryFilter(value)}
          style={{ width: 200, marginLeft: 10 }}
        >
          {[...new Set(items.map((item) => item.category).filter(Boolean))].map((cat) => (
            <Select.Option key={cat} value={cat}>
              {cat}
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* Inventory Table */}
      <Table
        columns={columns}
        dataSource={filteredItems}
        rowKey="id"
        style={{ marginTop: 10 }}
        onRow={(record) => ({
          onClick: () => {
            setSelectedItem(record);
            setIsDetailModalOpen(true); // For displaying the item details modal, this is prevented if an item being edited/removed
          }
        })}
      />

      {/* Modal for viewing item details for a selected item */}
      <Modal
        open={isDetailModalOpen}
        title="Item Details"
        footer={null}
        onCancel={() => setIsDetailModalOpen(false)}
      >
        {selectedItem && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Name">{selectedItem.name}</Descriptions.Item>
            <Descriptions.Item label="Description">{selectedItem.description}</Descriptions.Item>
            <Descriptions.Item label="Category">{selectedItem.category}</Descriptions.Item>
            <Descriptions.Item label="Price">${selectedItem.unitPrice.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="Quantity in Stock">{selectedItem.quantityInStock}</Descriptions.Item>
            <Descriptions.Item label="Reorder Level">{selectedItem.reorderLevel}</Descriptions.Item>
            <Descriptions.Item label="Quantity in Reorder">{selectedItem.quantityInReorder}</Descriptions.Item>
            <Descriptions.Item label="Reorder Time (Days)">{selectedItem.reorderTimeInDays}</Descriptions.Item>
            <Descriptions.Item label="Last Updated">{new Date(selectedItem.lastUpdated).toLocaleString()}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
}

