import "dotenv/config";

const BASE_URL = "https://api.asraye.com/api";

export interface ServerListing {
  id: string;
  name: string;
  members: number;
  description?: string;
  bumps?: number;
  [key: string]: any;
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
        },
      });
      return await res.json();
    } catch (err: any) {
      console.error("Discovery API Error (bumpServer):", err);
      return { error: err.message || "Failed to bump server." };
    }
  },
};

export default DiscoveryAPI;
