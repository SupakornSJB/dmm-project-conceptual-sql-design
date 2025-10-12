import {ObjectId, Space, SpaceBooking, Time, User} from "./nosql-design";

const ExampleSpaceCollection: Space[] = [{
    _id: new ObjectId("111111111111111"),
    name: "Shared working space",
    description: "This is a shared working space",
    availableFacilities: [
        {
            type: "TV",
            totalAmount: 10,
            name: "LG TV",
            details: {
                resolution: "1920x1080",
                weight: "10 kg"
            },
            rentalRates: [
                {
                    time: new ObjectId("5555555555555555"), // Time
                    costPerUnit: 4
                },
                {
                    time: new ObjectId("666666666666666"), // Time
                    costPerUnit: 10
                },
                {
                    time: new ObjectId("777777777777777"), // Time
                    costPerUnit: 20
                },
            ]
        }
    ],
    capacity: {
        roomSize: "30x40",
        size: 10 // people
    },
    feedbacks: [
        {
            user: new ObjectId("00000000000000"),
            createAt: new Date("2025-01-10"),
            rating: 5,
            comment: "Very nice room"
        },
        {
            user: new ObjectId("11111111111111"),
            createAt: new Date("2025-01-10"),
            rating: 5,
            comment: "Very nice room"
        },
    ],
    locations: {
        name: "Pathumthani",
        latitude: 0,
        longitude: 0,
        location: "111/11 Kaosan Rd."
    },
    owners: [
        new ObjectId("22222222222222")
    ],
    rentalRates: [
        {
            costPerUnit: 180,
            time: new ObjectId("5555555555555")
        },
        {
            costPerUnit: 100,
            time: new ObjectId("6666666666666")
        },
        {
            costPerUnit: 100,
            time: new ObjectId("7777777777777")
        },
    ]
}];

const ExampleSpaceBookingCollection: SpaceBooking[] = [{
    _id: new ObjectId("333333333333"),
    bookedBy: new ObjectId("22222222222222"),
    startTime: new Date("2025-01-10"),
    space: new ObjectId("11111111111111"),
    bookedFacilities: [
        {
            name: "LG TV",
            amount: 1,
        }
    ],
    selectedRentalRate: {
        time: new ObjectId("555555555555555"),
        costPerUnit: 0
    },
    bookedAmount: 3
}];

const ExampleUserCollection: User[] = [{
    _id: new ObjectId("22222222222222"),
    accountType: "",
    createdAt: undefined,
    email: "",
    locations: [],
    name: "",
    updatedAt: undefined
}];

const ExampleTimeCollection: Time[] = [
    {
        _id: new ObjectId("5555555555555555555"),
        description: "Full day",
        minutesPerUnit: 1440
    },
    {
        _id: new ObjectId("6666666666666666666"),
        description: "Half day",
        minutesPerUnit: 720
    },
    {
        _id: new ObjectId("7777777777777777777"),
        description: "Hour",
        minutesPerUnit: 60
    },
]
