export class ObjectId {constructor(public readonly id: string) { }}

// MAIN COLLECTION - Only these are actual collections
export interface User {
    _id: ObjectId
    name: string
    email: string
    createdAt: Date
    updatedAt: Date
    accountType: string
    locations: Location[]
}

export interface Space {
    _id: ObjectId
    name: string
    description: string
    owners: ObjectId[]
    locations: Location,
    capacity: SpaceCapacity,
    availableFacilities: Facility[],
    rentalRates: RentalRate[],
    feedbacks: UserFeedback[]
}

export interface SpaceBooking {
    _id: ObjectId
    space: ObjectId
    bookedBy: ObjectId
    approvedBy: ApprovedBy // Admin approval
    reason: string // Reason for booking (may not be necessary)
    startTime: Date
    bookedAmount: number // I don't understand this
    bookedFacilities: BookedFacility[]
    selectedRentalRate: RentalRate,
}

export interface Time { // I don't think this is used
    _id: ObjectId
    description: string
    minutesPerUnit: number
}

// EMBEDDED - These aren't collections, just embeded into collection
export interface Location {
    name: string
    location: string
    latitude: number
    longitude: number
}

export interface RentalRate {
    time: ObjectId // Time
    costPerUnit: number
}

export interface SpaceCapacity {
    size: number
    roomSize: string
}

export interface Facility {
    type: string
    totalAmount: number
    name: string,
    details: Object
    rentalRates: RentalRate[]
}

export interface BookedFacility {
    name: string,
    amount: number
}

export interface UserFeedback {
    user: ObjectId,
    createAt: Date,
    rating: number,
    comment: string
}

export interface ApprovedBy { // Approved by user id on this date
    userId: ObjectId,
    approvedAt: Date
}