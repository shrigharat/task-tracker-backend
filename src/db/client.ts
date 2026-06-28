import { Mongoose } from "mongoose";

let _client : Mongoose | null;

const connect = async () => {
    if (!_client) {
        const mongoose = new Mongoose();
        _client = await mongoose.connect(process.env.MONGO_URI as string);
    }
    return _client;
}

export {connect}