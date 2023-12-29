<template>
  <div class="main-page-container">
    <div class="header">
      <h1>Welcome to the DTR System</h1>
      <p>Please log in to access the system</p>
    </div>
    <div class="login-section">
      <div class="login-form">
        <label for="username">ID Number</label>
        <input type="text" id="username" v-model="username" placeholder="Enter your username" required />
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" placeholder="Enter your password" required />
        <button @click="userLogin">Log In</button>
      </div>
      <div class="signin-link">
        Don't have an account? <router-link to="/signup">Sign up</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import Parse from 'parse'
export default {
  name: "MainPageView",
  data() {
    return {
      username: "",
      password: "",
    };
  },
  methods: {
    async userLogin() {
      try {
        const query = new Parse.Query(Parse.User);
        query.equalTo("username", this.username);
        const user = await query.first();

        if (user) {
          await Parse.User.logIn(this.username, this.password);
          const currentUser = Parse.User.current();
          const TimeRecord = Parse.Object.extend("TimeRecord");
          const timeRecordQuery = new Parse.Query(TimeRecord);
          timeRecordQuery.equalTo("user", currentUser);
          timeRecordQuery.doesNotExist("timeOut");
          const timeRecord = await timeRecordQuery.first();

          if (timeRecord) {
            this.$router.push({
              name: "DashboardView",
              query: { objectId: timeRecord.id },
            });
          } else {
            const User = Parse.Object.extend(Parse.User);
            const query = new Parse.Query(User);
            query.equalTo("username", this.username);
            const result = await query.first();
            const count = await query.count();

            for (let i = 0; i < count; i++) {
              this.$router.push({
                name: "DashboardView",
                query: { userId: result.id }
              });
            }
          }
        } else {
          alert("User does not exist.");
        }
      } catch (error) {
        alert("Error " + error.code + ": " + error.message);
      }
    },
  },
};
</script>

<style scoped>
.signin-link {
  margin-top: 10px;
  text-align: center;
  color: #555;
}

.signin-link a {
  color: #007bff;
  text-decoration: none;
}

.signin-link a:hover {
  text-decoration: underline;
}

.main-page-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f4f4f4;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 2.5rem;
  color: #333;
}

.header p {
  color: #666;
  font-size: 1.2rem;
}

.login-section {
  width: 400px;
  background-color: #fff;
  padding: 30px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.login-form {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: bold;
  margin-bottom: 10px;
}

input {
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background-color: #0056b3;
}
</style>
