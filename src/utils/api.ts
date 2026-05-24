/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";

const BASE_URL = "http://localhost:4000/api";

export interface ServerListing {
  id: string;
  name: string;
  members: number;
  description?: string;
  bumps?: number;
  [key: string]: any;
}

export interface PlatformStats {
  total_servers: number;
  total_members: number;
}

export interface ApiResponse {
  error?: string;
  success?: boolean;
}

export interface BumpResponse extends ApiResponse {
  message?: string;
}

const DiscoveryAPI = {
  /**
   * Fetch statistics
   */
  getStats: async (): Promise<PlatformStats | ApiResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/stats`);
      return await res.json();
    } catch (err) {
      console.error("Discovery API Error (getStats):", err);
      return { error: "Failed to fetch platform statistics." };
    }
  },

  /**
   * Fetch all server listings
   */
  getServers: async (sort = "bumps", query = ""): Promise<ServerListing[] | ApiResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/servers?sort=${sort}&q=${query}`);
      return await res.json();
    } catch (err) {
      console.error("Discovery API Error (getServers):", err);
      return { error: "Failed to fetch servers." };
    }
  },

  /**
   * Retrieve data for a single specific server.
   */
  getServer: async (serverId: string): Promise<ServerListing | ApiResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/servers/${serverId}`);
      return await res.json();
    } catch (err) {
      console.error("Discovery API Error (getServer):", err);
      return { error: "Server listing not found." };
    }
  },

  /**
   * Publish a new server
   */
  addServer: async (serverData: Partial<ServerListing>): Promise<ApiResponse> => {
    try {
      const apiKey = process.env.DISCOVERY_API_KEY;
      if (!apiKey) throw new Error("Missing DISCOVERY_API_KEY environment variable.");

      const res = await fetch(`${BASE_URL}/servers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(serverData),
      });
      return await res.json();
    } catch (err: any) {
      console.error("Discovery API Error (addServer):", err);
      return { error: err.message || "Failed to post to discovery server." };
    }
  },

  /**
   * Delist and permanently delete a server from discovery.
   */
  deleteServer: async (serverId: string, ownerId: string): Promise<ApiResponse> => {
    try {
      const apiKey = process.env.DISCOVERY_API_KEY;
      if (!apiKey) throw new Error("Missing DISCOVERY_API_KEY environment variable.");

      const res = await fetch(`${BASE_URL}/servers/${serverId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ owner_id: ownerId }),
      });

      if (!res.ok) {
        const isJson = res.headers.get("content-type")?.includes("application/json");
        if (isJson) {
          const jsonErr = await res.json();
          return { error: jsonErr.message || "Failed to delist server." };
        } else {
          const textErr = await res.text();
          return { error: textErr || `Failed with status code ${res.status}` };
        }
      }

      return await res.json();
    } catch (err: any) {
      console.error("Discovery API Error (deleteServer):", err);
      return { error: err.message || "Failed to delete server listing." };
    }
  },

  /**
   * Bump a server (woo!)
   */
  bumpServer: async (serverId: string): Promise<BumpResponse> => {
    try {
      const apiKey = process.env.DISCOVERY_API_KEY;
      if (!apiKey) throw new Error("Missing DISCOVERY_API_KEY environment variable.");

      const res = await fetch(`${BASE_URL}/servers/${serverId}/bump`, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const isJson = res.headers.get("content-type")?.includes("application/json");
        if (isJson) {
          const jsonErr = await res.json();
          return { error: jsonErr.message || "An API error occurred." };
        } else {
          const textErr = await res.text();
          return {
            error: textErr || `Server returned status code ${res.status}`,
          };
        }
      }

      return await res.json();
    } catch (err: any) {
      console.error("Discovery API Error (bumpServer):", err);
      return { error: err.message || "Failed to bump server." };
    }
  },

  /**
   * Set the NSFW status of a server
   */
  setNsfw: async (serverId: string, nsfw: boolean): Promise<ApiResponse> => {
    try {
      const apiKey = process.env.DISCOVERY_API_KEY;
      if (!apiKey) throw new Error("Missing DISCOVERY_API_KEY environment variable.");

      const res = await fetch(`${BASE_URL}/servers/${serverId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ is_nsfw: nsfw ? 1 : 0 }),
      });

      if (!res.ok) {
        const isJson = res.headers.get("content-type")?.includes("application/json");
        if (isJson) {
          const jsonErr = await res.json();
          return { error: jsonErr.message || "Failed to update server properties." };
        } else {
          const textErr = await res.text();
          return { error: textErr || `Server returned status code ${res.status}` };
        }
      }

      return await res.json();
    } catch (err: any) {
      console.error("Discovery API Error (setNsfw):", err);
      return { error: err.message || "Failed to update NSFW flag." };
    }
  },

};

export default DiscoveryAPI;
