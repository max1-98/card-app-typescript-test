import { server } from "../src/server"
import Prisma from "../src/db";
const fs = require('fs');

describe('Create/Get/Edit/Delete/Sort by/ Entry Model', () => {
  beforeEach(async () => {
    await Prisma.entry.deleteMany({}); // Clear the database before each test
  });

  it('should create an Entry instance', async () => {

    const entries_init = await Prisma.entry.findMany();
    expect(entries_init.length).toBe(0); // Verify the database is empty

    const payload = {
      title: 'Hello world!',
      description: 'This is the description of the first Entry!',
      created_at: "2025-02-16T00:00:00.000Z",
      scheduled_for: "2025-02-18T00:00:00.000Z",
    };

    await Prisma.entry.create({data: payload});

    // Verify the entry exists in the database
    const entries = await Prisma.entry.findMany();
    expect(entries.length).toBe(1);

    // Verify the entry has been created properly
    expect(entries[0].title).toBe('Hello world!');
    expect(entries[0].description).toBe('This is the description of the first Entry!');
    expect(entries[0].created_at.toISOString()).toBe('2025-02-16T00:00:00.000Z');
    expect(entries[0].scheduled_for.toISOString()).toBe('2025-02-18T00:00:00.000Z');
  });

  // Test for Getting a particular entry

  // Test for Editting a particular entry

  // Test for Deleting a particular entry

  // Test for Sorting particular entry's by scheduled_for time
  it("should fetch all Entry's between two dates", async () => {

    const entries_init = await Prisma.entry.findMany();
    expect(entries_init.length).toBe(0); // Verify the database is empty

    const data = JSON.parse(fs.readFileSync('test/entry_data_1.json', 'utf8'));

    // Iterate through the data and create entries
    for (const entry of data) {
      await Prisma.entry.create({ data: entry });
    }

    const entries = await Prisma.entry.findMany();
    expect(entries.length).toBe(10);

    const startDate = "2025-02-20T00:00:00.000Z";
    const endDate = "2025-02-24T00:00:00.000Z";

    const entries_between = await Prisma.entry.findMany({
      where: {
        scheduled_for: {
          gte: startDate, // Greater than or equal to the start date
          lte: endDate,   // Less than or equal to the end date
        },
      },
    });

    expect(entries_between.length).toBe(5);
  })
})


describe('Create Entry endpoint', () => {
  beforeEach(async () => {
    await Prisma.entry.deleteMany({}); // Clear the database before each test
  });

  it('should create a new entry', async () => {

    const entries_init = await Prisma.entry.findMany();
    expect(entries_init.length).toBe(0); // Verify the database is empty

    const payload = {
      title: 'Hello world!',
      description: 'This is the description of the first Entry!',
      created_at: "2025-02-16T00:00:00.000Z",
      scheduled_for: "2025-02-18T00:00:00.000Z",
    };

    const response = await fetch('http://localhost:3001/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(201); // Check for successful creation status

    // Check the response sends the correct
    const data = await response.json();

    expect(data.msg).toBe("Entry successfully created");

    // Verify the entry exists in the database
    const entries = await Prisma.entry.findMany();
    expect(entries.length).toBe(1);
  });

  it('should return a ... status', async () => {

    const entries_init = await Prisma.entry.findMany();
    expect(entries_init.length).toBe(0); // Verify the database is empty

    // Payload with missing scheduled_for (should create with default date)
    const payload_sf = {
      title: 'Hello world!',
      description: 'This is the description of the first Entry!',
      created_at: "2025-02-16T00:00:00.000Z",
    };

    const response_1 = await fetch('http://localhost:3001/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload_sf),
    });

    expect(response_1.status).toBe(201);

    // Payload with missing created_at (should create with default date)
    const payload_ca = {
      title: 'Hello world!',
      description: 'This is the description of the first Entry!',
      scheduled_for: "2025-02-18T00:00:00.000Z",
    };

    const response_2 = await fetch('http://localhost:3001/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload_ca),
    });

    expect(response_2.status).toBe(201);

    // Payload with missing description
    const payload_d = {
      title: 'Hello world!',
      scheduled_for: "2025-02-18T00:00:00.000Z",
      created_at: "2025-02-16T00:00:00.000Z",
    };

    const response_3 = await fetch('http://localhost:3001/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload_d),
    });

    expect(response_3.status).toBe(400);


    // Payload with missing title
    const payload_t = {
      description: 'This is the description of the first Entry!',
      scheduled_for: "2025-02-18T00:00:00.000Z",
      created_at: "2025-02-16T00:00:00.000Z",
    };

    const response_4 = await fetch('http://localhost:3001/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload_t),
    });

    expect(response_4.status).toBe(400);

  });
  afterAll(async () => {
    await Prisma.entry.deleteMany({});
    await Prisma.$disconnect();
  });
});

describe('Fetch between dates endpoint' ,() => {
  beforeEach(async () => {
    await Prisma.entry.deleteMany({}); // Clear the database

    // Seed with the sample data
    const data = JSON.parse(fs.readFileSync('test/entry_data_1.json', 'utf8'));

    // Iterate through the data and create entries
    for (const entry of data) {
      await Prisma.entry.create({ data: entry });
    }
  });

  it("should fetch 5 events between the two dates sent", async () => {

    const date1 = "2025-02-20";
    const date2 = "2025-02-24"

    const response = await fetch(`http://localhost:3001/get_between/${date1}/${date2}/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status).toBe(200)

    // Check the response sends the correct
    const data = await response.json();
    expect(data.length).toBe(5);
  });
});

/*
 Remaining tests:
  - Update Entry
    create an Entry, store it's ID
    update each field individually and verify the change in the DB
    try to update each field using incorrect format and verify a 400 status and correct error

  - Delete Entry 
    create an Entry, store it's ID and verify it deletes
    create an Entry, use the wrong ID, verify a 404 is returned, with correct error

  - Get all Entry's (fixtures required)
    verify there are no entries
    use the JSON file of prepared Entries to create multiple tasks
    verify that all are fetched

  - Get particular Entry (fixtures required)
    create an Entry, store it's ID and fetch, verify status and the item has been correctly fetched
    try to fetch an Entry with an incorrect ID, verify status and correct error message
*/

