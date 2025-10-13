/**
 * MongoDB Atlas Seeder for Space Booking App
 * ------------------------------------------
 * Generates mock data for:
 *  - users
 *  - spaces
 *  - spaceBookings
 *  - promotions
 *  - times
 *
 * Uses Faker for random realistic values and ensures relationships are valid.
 */

import { faker } from "@faker-js/faker";
import { MongoClient, ObjectId } from "mongodb";

const uri = "mongodb+srv://st126233_db_user:ourspace_123@dmmcluster0.6jppzxb.mongodb.net/";
const client = new MongoClient(uri);
const dbName = "ourspace_2";

async function seed() {
  try {
    await client.connect();
    const db = client.db(dbName);

    const usersCol = db.collection("User");
    const spacesCol = db.collection("Space");
    const bookingsCol = db.collection("SpaceBooking");
    const promosCol = db.collection("Promotion");
    const timesCol = db.collection("Time");

    console.log("🧹 Clearing existing data...");
    await Promise.all([
      usersCol.deleteMany({}),
      spacesCol.deleteMany({}),
      bookingsCol.deleteMany({}),
      promosCol.deleteMany({}),
      timesCol.deleteMany({})
    ]);

    // -----------------------------------------------------
    // Generate Time Units
    // -----------------------------------------------------
    const times = [
      { _id: new ObjectId(), description: "Full Day", minutesPerUnit: 1440 },
      { _id: new ObjectId(), description: "Half Day", minutesPerUnit: 720 },
      { _id: new ObjectId(), description: "Hourly", minutesPerUnit: 60 }
    ];
    await timesCol.insertMany(times);
    console.log(`⏱ Inserted ${times.length} time units`);

    // -----------------------------------------------------
    // Generate Users
    // -----------------------------------------------------
    const users = Array.from({ length: 100 }, () => {
      const id = new ObjectId();
      return {
        _id: id,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        createdAt: faker.date.past(),
        updatedAt: new Date(),
        accountType: faker.helpers.arrayElement(["admin", "user"]),
        dateOfBirth: faker.date.birthdate(),
        loyaltyPoints: faker.number.int({ min: 0, max: 5000 }),
        locations: [
          {
            name: faker.company.name(),
            location: faker.location.city(),
            latitude: faker.location.latitude(),
            longitude: faker.location.longitude()
          }
        ],
        bookingTemplates: [] // leave empty for simplicity
      };
    });
    await usersCol.insertMany(users);
    console.log(`👤 Inserted ${users.length} users`);

    // -----------------------------------------------------
    // Generate Spaces
    // -----------------------------------------------------
    const spaces = Array.from({ length: 100 }, () => {
      const id = new ObjectId();
      const owner = faker.helpers.arrayElement(users)._id;
      const rentalRates = [
        {
          time: faker.helpers.arrayElement(times)._id,
          costPerUnit: faker.number.float({ min: 50, max: 300, fractionDigits: 1 })
        },
        {
          time: faker.helpers.arrayElement(times)._id,
          costPerUnit: faker.number.float({ min: 20, max: 150, fractionDigits: 1 })
        }
      ];
      const facilities = [
        {
          type: "Projector",
          totalAmount: faker.number.int({ min: 1, max: 3 }),
          name: faker.commerce.productName(),
          details: { resolution: "1080p", connectivity: "HDMI, WiFi" },
          rentalRates: rentalRates
        },
        {
          type: "Whiteboard",
          totalAmount: 1,
          name: "Magnetic Whiteboard",
          details: { size: "4x6 ft" },
          rentalRates: rentalRates
        }
      ];
      return {
        _id: id,
        name: faker.company.name() + " Space",
        description: faker.lorem.sentences(2),
        owners: [owner],
        locations: {
          name: faker.company.name(),
          location: faker.location.city(),
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude()
        },
        capacity: {
          size: faker.number.int({ min: 5, max: 100 }),
          roomSize: faker.helpers.arrayElement(["Small", "Medium", "Large"])
        },
        availableFacilities: facilities,
        rentalRates: rentalRates,
        feedbacks: [
          {
            user: owner,
            createAt: faker.date.recent(),
            rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
            comment: faker.lorem.sentence()
          }
        ]
      };
    });
    await spacesCol.insertMany(spaces);
    console.log(`🏢 Inserted ${spaces.length} spaces`);

    // -----------------------------------------------------
    // Fill bookingTemplates for users now that spaces exist
    // -----------------------------------------------------
    for (const user of users) {
      const templatesCount = faker.number.int({ min: 1, max: 2 });
      for (let t = 0; t < templatesCount; t++) {
        const space = faker.helpers.arrayElement(spaces);
        const selectedRate = faker.helpers.arrayElement(space.rentalRates);
        user.bookingTemplates.push({
          _id: new ObjectId(),
          space: space._id,
          createdAt: faker.date.recent(),
          updatedAt: new Date(),
          rentalUnit: faker.number.int({ min: 1, max: 2 }),
          bookedFacilities: space.availableFacilities.map(f => ({
            facility: f,
            amount: faker.number.int({ min: 1, max: f.totalAmount })
          })),
          selectedRentalRate: selectedRate,
          recurring: faker.datatype.boolean()
            ? {
                hour: faker.number.int({ min: 0, max: 23 }),
                minute: faker.number.int({ min: 0, max: 59 }),
                dayOfWeek: faker.number.int({ min: 0, max: 6 }),
                bookAheadAmount: faker.number.int({ min: 1, max: 10 })
              }
            : undefined
        });
      }
    }
    // Update users collection with bookingTemplates
    await Promise.all(users.map(u => usersCol.updateOne({ _id: u._id }, { $set: { bookingTemplates: u.bookingTemplates } })));
    console.log("📄 Filled bookingTemplates for all users");

    // -----------------------------------------------------
    // Generate Promotions
    // -----------------------------------------------------
    const promotions: any[] = [];
    for (let i = 0; i < 100; i++) {
      const assignSpaces = faker.datatype.boolean();
      const assignUsers = faker.datatype.boolean();

      promotions.push({
        _id: new ObjectId(),
        code: faker.string.alpha({ length: 6, casing: "upper" }),
        description: faker.lorem.sentence(),
        discountPercent: faker.number.int({ min: 5, max: 30 }),
        validFrom: faker.date.recent({ days: 20 }),
        validTo: faker.date.future({ years: 1 }),
        applicableSpaces: assignSpaces
          ? faker.helpers.arrayElements(spaces, faker.number.int({ min: 1, max: 5 })).map(s => s._id)
          : "all",
        applicableUsers: assignUsers
          ? faker.helpers.arrayElements(users, faker.number.int({ min: 1, max: 5 })).map(u => u._id)
          : "all"
      });
    }
    await promosCol.insertMany(promotions);
    console.log(`🎁 Inserted ${promotions.length} promotions`);

    // -----------------------------------------------------
    // Generate Bookings
    // -----------------------------------------------------
    const bookings = Array.from({ length: 100 }, () => {
      const space = faker.helpers.arrayElement(spaces);
      const user = faker.helpers.arrayElement(users);
      const promo = faker.helpers.arrayElement(promotions);
      const selectedRate = faker.helpers.arrayElement(space.rentalRates);

      const startTime = faker.date.future({ years: 0.1 });
      const rentalMinutes = times.find(t => t._id.equals(selectedRate.time))?.minutesPerUnit ?? 60;
      const rentalUnit = faker.number.int({ min: 1, max: 2 });

      return {
        _id: new ObjectId(),
        space: space._id,
        bookedBy: user._id,
        approvedBy: {
          userId: user._id,
          approvedAt: faker.date.recent()
        },
        reason: faker.lorem.sentence(),
        startTime: startTime,
        rentalUnit: rentalUnit,
        bookedFacilities: space.availableFacilities.map((f: { totalAmount: any; }) => ({
          facility: f,
          amount: faker.number.int({ min: 1, max: f.totalAmount })
        })),
        selectedRentalRate: selectedRate,
        discountApplied: faker.datatype.boolean(),
        discountType: faker.helpers.arrayElement(["repeat", "birth month"]),
        discountPercentage: faker.number.int({ min: 5, max: 20 }),
        promotionId: promo._id
      };
    });
    await bookingsCol.insertMany(bookings);
    console.log(`📅 Inserted ${bookings.length} bookings`);

    console.log("✅ All mock data inserted successfully!");
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  } finally {
    await client.close();
  }
}

seed();
