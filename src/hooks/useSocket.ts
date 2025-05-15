import { useContext } from "react";
import {
  SocketContext,
  SocketContextState, // Assuming SocketContextState is exported from SocketContext.tsx
} from "../contexts/SocketContext"; // Adjust path if necessary

export const useSocket = (): SocketContextState => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
