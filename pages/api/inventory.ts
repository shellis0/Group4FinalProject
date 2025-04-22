// A new file for handling requests for the Smart Inventory System
// Referenced material: https://www.w3schools.com/tags/ref_httpmethods.asp
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const itemId = parseInt(req.query.id);

  switch (req.method) {
    case 'GET':
      try {
        const inventory = await prisma.inventory.findMany({
          orderBy: { lastUpdated: 'desc' }
        });
        res.status(200).json(inventory);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching inventory', error });
      }
      break;

    case 'POST':
      try {
        const { name, description, unitPrice, quantityInStock, reorderLevel, reorderTimeInDays, quantityInReorder, category } = req.body;
        const newItem = await prisma.inventory.create({
          data: { name, description, unitPrice, quantityInStock, reorderLevel, reorderTimeInDays, quantityInReorder, category }
        });
        const created = await prisma.inventory.findUnique({ where: { id: newItem.id } });
        res.status(201).json(created);
      } catch (error) {
        res.status(500).json({ message: 'Error creating item', error });
      }
      break;

    case 'PUT':
      if (!itemId) return res.status(400).json({ message: 'ID is required for update' });

      try {
        await prisma.inventory.update({
          where: { id: itemId },
          data: req.body
        });

        const refreshed = await prisma.inventory.findUnique({ where: { id: itemId } });
        res.status(200).json(refreshed);
      } catch (error) {
        res.status(500).json({ message: 'Error updating item', error });
      }
      break;

    case 'DELETE':
      if (!itemId) return res.status(400).json({ message: 'ID is required for deletion' });

      try {
        await prisma.inventory.delete({ where: { id: itemId } });
        res.status(200).json({ message: 'Item deleted' });
      } catch (error) {
        res.status(500).json({ message: 'Error deleting item', error });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
