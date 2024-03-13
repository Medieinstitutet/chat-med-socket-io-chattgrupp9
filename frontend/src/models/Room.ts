import { Chatt } from "./Chatt";

export type Room = {
  roomId: string;
  roomName: string;
  Chatts: Chatt[];
}