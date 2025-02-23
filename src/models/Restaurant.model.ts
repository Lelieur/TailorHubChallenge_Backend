import { Schema, model } from 'mongoose';

const restaurantSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Add a name to the restaurant'],
        minlength: [3, 'The restaurant name must be at least 3 characters long']
    },
    neighborhood: {
        type: String,
        required: [true, 'Add a neighborhood to the restaurant'],
        minlength: [3, 'The neighborhood must be at least 3 characters long']
    },
    address: {
        type: String,
        required: [true, 'Add an address to the restaurant'],
        minlength: [3, 'The address must be at least 3 characters long']
    },
    photograph: {
        type: String,
        required: [true, 'Add a photograph to the restaurant']
    },
    latlng: {
        type: Object,
        required: [true, 'Add a latitude and longitude to the restaurant']
    },
    image: {
        type: String,
        required: [true, 'Add an image to the restaurant']
    },
    cuisine_type: {
        type: String,
        required: [true, 'Add a cuisine type to the restaurant'],
        minlength: [3, 'The cuisine type must be at least 3 characters long']
    },
    operating_hours: {
        type: Object,
        required: [true, 'Add operating hours to the restaurant']
    },
    reviews: {
        type: [Object],
    }
}, { timestamps: true });

const Restaurant = model('Restaurant', restaurantSchema);

export default Restaurant;