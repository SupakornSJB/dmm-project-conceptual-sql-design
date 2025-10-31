// Unique indexes in the data model
CREATE CONSTRAINT user_email_unique IF NOT EXISTS
  FOR (u:User) REQUIRE (u.email) IS UNIQUE;

CREATE CONSTRAINT space_id_unique IF NOT EXISTS
  FOR (s:Space) REQUIRE (s.spaceId) IS UNIQUE;

CREATE CONSTRAINT booking_id_unique IF NOT EXISTS
  FOR (b:Booking) REQUIRE (b.bookingId) IS UNIQUE;

CREATE CONSTRAINT feedback_id_unique IF NOT EXISTS
  FOR (f:Feedback) REQUIRE (f.feedbackId) IS UNIQUE;

CREATE INDEX IF NOT EXISTS FOR (s:Space) ON (s.location);
CREATE INDEX IF NOT EXISTS FOR (s:Space) ON (s.capacitySize);
CREATE INDEX IF NOT EXISTS FOR (r:Rate) ON (r.costPerUnit);




// Delete before repopulating if needed
MATCH (n) DETACH DELETE n;

// Time units
CREATE (tH:TimeUnit {timeUnitId: randomUUID(), name: 'hour', minutesPerUnit: 60});
CREATE (tHalf:TimeUnit {timeUnitId: randomUUID(), name: 'half_day', minutesPerUnit: 720});
CREATE (tDay:TimeUnit {timeUnitId: randomUUID(), name: 'full_day', minutesPerUnit: 1440});

// Facilities
CREATE (fProj:Facility {facilityId: randomUUID(), name: 'Projector', type:'projector', totalAmount:5});
CREATE (fWifi:Facility {facilityId: randomUUID(), name: 'Wifi', type:'internet', totalAmount:50});
CREATE (fPrinter:Facility {facilityId: randomUUID(), name: 'Printer', type:'printer', totalAmount:2});
CREATE (fMic:Facility {facilityId: randomUUID(), name: 'Audio System', type:'audio', totalAmount:2});

// Users (owners + customers)
CREATE (u1:User {userId: randomUUID(), name: 'Supakorn', email: 'owner1@ourspace.test', accountType:'owner', joinedAt: date('2025-01-10')});
CREATE (u2:User {userId: randomUUID(), name: 'Prasiddha', email: 'customer1@ourspace.test', accountType:'customer', joinedAt: date('2025-06-01')});
CREATE (u3:User {userId: randomUUID(), name: 'Waranon', email: 'owner2@ourspace.test', accountType:'owner', joinedAt: date('2025-04-20')});

// Spaces (owners list them)
CREATE (s1:Space {spaceId: randomUUID(), name: 'CoWork Central', description:'large open space', location:'Pathumthani', capacitySize:80, capacityLabel:'Large', baseCurrency:'THB'});
CREATE (s2:Space {spaceId: randomUUID(), name: 'Meeting Room A', description:'small meeting room', location:'Bangkok', capacitySize:8, capacityLabel:'Small', baseCurrency:'THB'});
CREATE (s3:Space {spaceId: randomUUID(), name: 'Presentation Hall', description:'projector ready hall', location:'Pathumthani', capacitySize:120, capacityLabel:'XL'});
CREATE (s4:Space {spaceId: randomUUID(), name: 'Studio Room', description:'for tutorials and recordings', location:'Bangkok', capacitySize:30, capacityLabel:'Medium'});

// Owners own spaces
MATCH (o1:User {email:'owner1@ourspace.test'}), (o2:User {email:'owner2@ourspace.test'}),
      (a:Space {name:'CoWork Central'}), (b:Space {name:'Meeting Room A'}), (c:Space {name:'Presentation Hall'}), (d:Space {name:'Studio Room'})
CREATE (o1)-[:OWNS]->(a),
       (o1)-[:OWNS]->(b),
       (o2)-[:OWNS]->(c),
       (o2)-[:OWNS]->(d);

// Link spaces to facilities with counts
MATCH (a:Space {name:'CoWork Central'}), (b:Space {name:'Meeting Room A'}),
      (c:Space {name:'Presentation Hall'}), (d:Space {name:'Studio Room'}),
      (p:Facility {name:'Projector'}), (w:Facility {name:'Wifi'}), (pr:Facility {name:'Printer'}), (au:Facility {name:'Audio System'})
CREATE (a)-[:HAS_FACILITY {count:2, rentalRate:null}]->(p),
       (a)-[:HAS_FACILITY {count:50}]->(w),
       (b)-[:HAS_FACILITY {count:1}]->(p),
       (b)-[:HAS_FACILITY {count:1}]->(w),
       (c)-[:HAS_FACILITY {count:4}]->(p),
       (c)-[:HAS_FACILITY {count:2}]->(au),
       (c)-[:HAS_FACILITY {count:50}]->(w),
       (d)-[:HAS_FACILITY {count:1}]->(pr),
       (d)-[:HAS_FACILITY {count:1}]->(w);

// Rates: create Rate nodes and link to TimeUnit + Space
MATCH (tH:TimeUnit {name:'hour'}), (tHalf:TimeUnit {name:'half_day'}), (tDay:TimeUnit {name:'full_day'}),
      (a:Space {name:'CoWork Central'}), (b:Space {name:'Meeting Room A'}), (c:Space {name:'Presentation Hall'}), (d:Space {name:'Studio Room'})
CREATE (r1:Rate {rateId:randomUUID(), costPerUnit:300})-[:FOR_TIME]->(tH),
       (r2:Rate {rateId:randomUUID(), costPerUnit:1200})-[:FOR_TIME]->(tHalf),
       (r3:Rate {rateId:randomUUID(), costPerUnit:2000})-[:FOR_TIME]->(tDay),
       (r4:Rate {rateId:randomUUID(), costPerUnit:150})-[:FOR_TIME]->(tH),
       (r5:Rate {rateId:randomUUID(), costPerUnit:500})-[:FOR_TIME]->(tHalf),
       (r6:Rate {rateId:randomUUID(), costPerUnit:1500})-[:FOR_TIME]->(tDay),
       (r7:Rate {rateId:randomUUID(), costPerUnit:600})-[:FOR_TIME]->(tH),
       (r8:Rate {rateId:randomUUID(), costPerUnit:2200})-[:FOR_TIME]->(tDay)
CREATE (a)-[:HAS_RATE]->(r1),(a)-[:HAS_RATE]->(r2),(a)-[:HAS_RATE]->(r3),
       (b)-[:HAS_RATE]->(r4),(b)-[:HAS_RATE]->(r5),
       (c)-[:HAS_RATE]->(r7),(c)-[:HAS_RATE]->(r8),
       (d)-[:HAS_RATE]->(r4);

// Add promotions
CREATE (promo1:Promotion {promoId:randomUUID(), code:'WELCOME10', discountPercent:10, validFrom: date('2025-01-01'), validTo: date('2025-12-31')});
MATCH (s1:Space {name:'CoWork Central'}) CREATE (promo1)-[:APPLIES_TO]->(s1);

// Some bookings can be listed as below
// Booking 1: Prasiddha books Meeting Room A next Monday for 2 hours with projector
MATCH (cust:User {email:'customer1@ourspace.test'}), (space:Space {name:'Meeting Room A'}), (r:Rate)-[:FOR_TIME]->(tH)
WHERE r.costPerUnit = 150
CREATE (b1:Booking {bookingId: randomUUID(), startTime: datetime('2025-11-03T10:00:00'), rentalUnit:2, status:'CONFIRMED', discountApplied:false, totalCost: 150*2})
CREATE (cust)-[:BOOKED]->(b1),
       (b1)-[:BOOKS]->(space),
       (b1)-[:INCLUDES_FACILITY {amount:1}]->(:Facility {tempName:'Projector (booked)'});  // simple representation

// Booking 2: Another booking to seed trending / revenue
MATCH (cust2:User {email:'customer1@ourspace.test'}), (space2:Space {name:'CoWork Central'})
CREATE (b2:Booking {bookingId: randomUUID(), startTime: datetime('2025-10-15T09:00:00'), rentalUnit:4, status:'COMPLETED', discountApplied:false, totalCost:300*4})
CREATE (cust2)-[:BOOKED]->(b2),
       (b2)-[:BOOKS]->(space2);

// Feedbacks
MATCH (cust:User {email:'customer1@ourspace.test'}), (space:Space {name:'CoWork Central'})
CREATE (f1:Feedback {feedbackId: randomUUID(), createdAt: datetime('2025-10-16T12:00:00'), rating:5, comment:'Great space!'})
CREATE (cust)-[:GAVE_FEEDBACK]->(f1),
       (f1)-[:FOR]->(space);
