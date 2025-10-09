interface ObjectId {}

interface User {
    _id: ObjectId
    name: string
    email: string
    createdAt: Date
    updatedAt: Date
    accountType: string
    locations: {
        name: string
        location: string
        latitude: number
        longitude: number
    }[]
}

interface Space {
    _id: ObjectId
    name: string
    owner: ObjectId
    locations: {
        name: string
        latitude: number
        longitude: number
    },
    capacity: {
        size: number
        roomSize: string
    },
    availableFacilities: {
        type: string
        availableAmount: number
        name: string,
        details: Object
        costPerUnit: number
        minutesPerUnit: number
    }[],
    rentalRates: {
        code: string // "FD"
        costPerUnit: number
        minutesPerUnit: number
    }[],
    feedbacks: {
        user: ObjectId,
        createAt: Date,
        rating: number,
    }[]
}

interface SpaceBooking {
    _id: ObjectId
    space: ObjectId
    bookedBy: ObjectId
    startTime: Date
    endTime: Date
    bookedFacilities: {
        name: string
        bookAmount: number
    }[]
}
