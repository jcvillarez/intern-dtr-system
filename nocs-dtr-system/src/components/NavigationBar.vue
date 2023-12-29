<template>
  <div class="time-tracking-app">
    <nav class="navbar">
      <div class="profile">
        <span class="username">{{ users.length ? users[0].name : "" }}</span>
      </div>
      <button class="logout-button" @click="logout">Logout</button>
    </nav>
  </div>
</template>
<script>
import "/src/assets/tailwind.css"; // added
import Parse from "parse";
export default {
  name: "NavigationBar",
  data() {
    return {
      users: [],
    };
  },
  methods: {
    logout() {
      Parse.User.logOut();
      this.$router.push("/");
    },
  },
  mounted: async function () {
    const query = new Parse.Query(Parse.User);
    const current = Parse.User.current().get("username");
    query.equalTo("username", current);
    const users = await query.find();
    this.users = users.map((user) => ({
      name: user.get("name"),
      id: user.id,
    }));
  },
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #333;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
}

.profile {
  display: flex;
  align-items: center;
}

.username {
  margin-right: 10px;
  font-weight: bold;
}

.logout-button {
  background-color: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-weight: bold;
}
</style>
