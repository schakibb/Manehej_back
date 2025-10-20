// Simple test script to verify the admin API setup
const http = require("http");

const testEndpoint = (path, method = "GET", data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3001,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers["Content-Length"] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsed,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
          });
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

async function runTests() {
  console.log("🧪 Testing Manehej Admin API Setup...\n");

  try {
    // Test 1: Health check
    console.log("1. Testing health endpoint...");
    const health = await testEndpoint("/health");
    if (health.status === 200) {
      console.log("✅ Health check passed");
    } else {
      console.log("❌ Health check failed:", health.status);
    }

    // Test 2: Root endpoint
    console.log("\n2. Testing root endpoint...");
    const root = await testEndpoint("/");
    if (root.status === 200) {
      console.log("✅ Root endpoint passed");
    } else {
      console.log("❌ Root endpoint failed:", root.status);
    }

    // Test 3: Login with default credentials
    console.log("\n3. Testing admin login...");
    const login = await testEndpoint("/api/admin/auth/login", "POST", {
      email: "admin@manehej.com",
      password: "Admin123!@#",
    });

    if (login.status === 200 && login.data.success) {
      console.log("✅ Admin login successful");
      console.log("   Token received:", login.data.data.token ? "Yes" : "No");

      // Test 4: Get profile with token
      console.log("\n4. Testing profile endpoint...");
      const profileOptions = {
        hostname: "localhost",
        port: 3001,
        path: "/api/admin/auth/profile",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${login.data.data.token}`,
        },
      };

      const profileReq = http.request(profileOptions, (res) => {
        let profileData = "";
        res.on("data", (chunk) => (profileData += chunk));
        res.on("end", () => {
          try {
            const profile = JSON.parse(profileData);
            if (res.statusCode === 200 && profile.success) {
              console.log("✅ Profile endpoint successful");
              console.log("   Admin name:", profile.data.name);
              console.log("   Admin email:", profile.data.email);
              console.log("   Admin role:", profile.data.role);
            } else {
              console.log("❌ Profile endpoint failed:", res.statusCode);
            }
          } catch (e) {
            console.log("❌ Profile parsing failed:", e.message);
          }
        });
      });

      profileReq.on("error", (e) => {
        console.log("❌ Profile request failed:", e.message);
      });

      profileReq.end();
    } else {
      console.log("❌ Admin login failed:", login.status, login.data.message);
    }
  } catch (error) {
    console.log("❌ Test failed:", error.message);
    console.log("\n💡 Make sure the server is running with: npm run dev");
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testEndpoint };
