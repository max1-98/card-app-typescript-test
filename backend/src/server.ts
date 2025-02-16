import fastify from "fastify";
import cors from "@fastify/cors";
import { Entry } from "@prisma/client";
import Prisma from "./db";
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";


export const server = fastify();

server.register(cors, {});

// Get all entries view
server.get<{ Reply: Entry[] }>("/get/", async (req, reply) => {
  const dbAllEntries = await Prisma.entry.findMany({});
  reply.status(200).send(dbAllEntries);
});

// Get particular entry view
server.get<{ Body: Entry; Params: { id: string } }>(
  "/get/:id/",
  async (req, reply) => {
    const dbEntry = await Prisma.entry.findUnique({
      where: { id: req.params.id },
    });
    if (!dbEntry) {
      reply.status(404).send({ msg: `Error finding entry with id ${req.params.id}` });
    }
    reply.status(200).send(dbEntry);
  }
);

// Fetch between view
server.get<{ Body: Entry; Params: { start_date: string, end_date: string } }>(
  "/get_between/:start_date/:end_date/",
  async (req, reply) => {
    console.log(req.params.start_date)
    const date1 = new Date(req.params.start_date)
    const date2 = new Date(req.params.end_date)
    
    try {
      const entries_between = await Prisma.entry.findMany({
        where: {
          scheduled_for: {
            gte: date1, 
            lte: date2,  
          },
        },
      });
      reply.status(200).send(entries_between);
    } catch (error) {
      reply.status(400).send({msg: "Please send a valid date"})
      // Handle error for passing in incorrect types, ie. not passing through dates, 
      // not passing both dates ext. (400 response)
      // In case of server error return 500 response as final resort
      // Don't respond with 404 for not found as this is not an error but expected
    };
  }
);

// Creation view
server.post<{ Body: Entry }>("/create/", async (req, reply) => {
  let newEntryBody = req.body;
  newEntryBody.created_at
    ? (newEntryBody.created_at = new Date(req.body.created_at))
    : (newEntryBody.created_at = new Date());
  newEntryBody.scheduled_for
    ? (newEntryBody.scheduled_for = new Date(req.body.scheduled_for))
    : (newEntryBody.scheduled_for = new Date());

  /* 
    Need to edit the model to handle the below, ie. setting:
     title to be non-empty
     description to be non-empty

    Which then returns a suitable entry rather than providing a switch like below. 
  */

  if (!newEntryBody.title) {
    reply.status(400).send({ msg: "Please provide a title" });
  }

  if (!newEntryBody.description) {
    reply.status(400).send({ msg: "Please provide a description" });
  }

  try {
    const createdEntryData = await Prisma.entry.create({ data: req.body });
    reply.status(201).send({msg: "Entry successfully created" });
  } catch (error) {

    // Check the error type for specific handling
    if (error instanceof PrismaClientKnownRequestError) {
      reply.status(400).send({ msg: error.message });
    } else if (error instanceof PrismaClientValidationError) {
      reply.status(400).send({ msg: error.message });
    } else {
      reply.status(500).send({ msg: "Internal server error" });
    }
  }
});

// Delete particular entry view
server.delete<{ Params: { id: string } }>("/delete/:id/", async (req, reply) => {
  try {
    await Prisma.entry.delete({ where: { id: req.params.id } });
    reply.send({ msg: "Deleted successfully" });
  } catch {
    reply.status(500).send({ msg: "Error deleting entry" });
  }
});

// Update particular entry view
server.put<{ Params: { id: string }; Body: Entry }>(
  "/update/:id/",
  async (req, reply) => {
    let updatedEntryBody = req.body;

    updatedEntryBody.created_at
      ? (updatedEntryBody.created_at = new Date(req.body.created_at))
      : (updatedEntryBody.created_at = new Date());

    updatedEntryBody.scheduled_for
      ? (updatedEntryBody.scheduled_for = new Date(req.body.scheduled_for))
      : (updatedEntryBody.scheduled_for = new Date());
    try {
      await Prisma.entry.update({
        data: req.body,
        where: { id: req.params.id },
      });
      reply.send({ msg: "Updated successfully" });
    } catch {
      reply.status(500).send({ msg: "Error updating" });
    }
  }
);


