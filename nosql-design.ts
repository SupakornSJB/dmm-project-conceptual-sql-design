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
    dateOfBirth: Date // For birth month discount
    loyaltyPoints: number // For loyalty points
    bookingTemplates: SpaceBookingTemplate[]
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
    approvedBy: ApprovedBy // Admin approval (may not be necessary)
    reason: string // Reason for booking (may not be necessary)
    startTime: Date
    rentalUnit: number
    bookedFacilities: BookedFacility[]
    selectedRentalRate: RentalRate,

    discountApplied: boolean // if repeat customer or birth month add a discount
    discountType: string // repeat or birth month
    discountPercentage: number // percentage of discount
    promotionId: ObjectId // reference promotion
}

export interface Promotion { // Special promotion
  _id: ObjectId,
  code: string,
  description: string,
  discountPercent: number,
  validFrom: Date,
  validTo: Date,
  applicableSpaces: ObjectId[] | "all",
  applicableUsers: ObjectId[] | "all"
}

export interface Time {
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
    facility: Facility,
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

export interface SpaceBookingTemplate {
    _id: ObjectId
    space: ObjectId
    createdAt: Date
    updatedAt: Date
    rentalUnit: number
    bookedFacilities: BookedFacility[]
    selectedRentalRate: RentalRate,
    recurring?: Recurring
}

export interface Recurring {
    hour: number,
    minute: number,
    dayOfWeek: number,
    bookAheadAmount: number // We cannot let the user book the same room until the end of time, so they can book ahead e.g. 10 times
}
