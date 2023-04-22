import { Entity } from "../entity";
import { Types } from "mongoose";
import { ITopic } from "./topic";

export interface IMeeting extends Entity {
    dateTime: Date;
    topics: Types.DocumentArray<ITopic>;
}
