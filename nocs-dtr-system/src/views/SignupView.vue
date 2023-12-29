<template>
  <div class="signup-container">
    <div class="signup-form">
      <form @submit.prevent="createUser">
        <div class="form-group">
          <label for="username">ID Number</label>
          <input v-model="username" type="text" id="username" required />
        </div>
        <div class="form-group">
          <label for="name">Name</label>
          <input v-model="name" type="text" id="name" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input v-model="password" type="password" id="password" required />
        </div>
        <div class="form-group">
          <label for="confirm-password">Confirm Password</label>
          <input
            v-model="confirm_password"
            type="password"
            id="confirm-password"
            required
          />
        </div>
        <button class="signup-button" type="submit">Create Account</button>
      </form>
      <div class="signin-link">
        Already have an account? <router-link to="/">Sign in</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import Parse from "parse";

export default {
  name: "SignupView",
  data() {
    return {
      name: "",
      username: "",
      password: "",
      confirm_password: "",
      roles: "user",
    };
  },
  methods: {
    async createUser() {
      if (this.password !== this.confirm_password) {
        alert("Password does not match!");
        return;
      }

      const useraccount = new Parse.User();
      useraccount.set("name", this.name);
      useraccount.set("username", this.username);
      useraccount.set("password", this.password);
      useraccount.set("roles", this.roles);

      try {
        await useraccount.signUp();
        alert("Account Successfully Created!");
        this.$router.push({
          name: "Home",
        });
      } catch (error) {
        alert(error.message);
      }
    },
  },
};
</script>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f4f4f4;
}

.signup-form {
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 400px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

input {
  width: 80%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.signup-button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.signup-button:hover {
  background-color: #0056b3;
}

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
</style>
