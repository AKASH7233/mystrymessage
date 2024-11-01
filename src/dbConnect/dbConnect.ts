import mongoose from "mongoose";

type ConnectionObject = {
    isConnected? : number
}

const connection : ConnectionObject = {}

const connectDatabase = async () : Promise<void> => {

    if(connection.isConnected) {
        console.log('Already connected to the database');
        return;
    }

    try {
        
        const db = await mongoose.connect(`${process.env.MONGO_URI!}/${process.env.DATABASE_NAME}`);

        connection.isConnected = db.connections[0].readyState 

        const mongoConnection = mongoose.connection

        mongoConnection.on('connection', () => {
            console.log('Connected to MongoDB');
        });

        mongoConnection.on('error', (error) => {
            console.log(`Error connecting to MongoDB: ${error}`);
            process.exit(1);
        });

    } catch (error) {
        console.log('Something went wrong during connecting to database !!',error)
        process.exit(1);
    }
}

export default connectDatabase