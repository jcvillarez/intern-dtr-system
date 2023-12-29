<style>
.admin-edit-body {
  @apply flex flex-col items-center justify-center font-['Inter'] h-[100vh] min-w-[800px];
}

/* lock */
.admin-edit-content {
  @apply flex flex-col items-center justify-start grow w-full max-w-[1280px] py-[30px];
}

/* lock */

.admin-edit-content>span {
  @apply font-black text-[35px] text-left w-full px-[5px] mt-4;
}

/* lock */

.admin-edit-frame {
  @apply flex flex-row items-start justify-center w-full h-[1px] grow mt-[20px] gap-10;
}

.admin-edit-frame>.edit {
  @apply flex flex-col items-start gap-5 text-[13px] p-[30px] w-[50%];
}

.admin-edit-frame>.edit>div {
  @apply flex flex-col items-start font-bold;
}

.admin-edit-frame>.edit>div>span {
  @apply font-normal text-[16px];
}

.admin-edit-frame>.edit>input,
.admin-edit-frame>.edit>select {
  @apply border-[1px] border-[#aaa] text-[13px] p-[10px] w-full;
}

.admin-edit-frame>.edit>button {
  @apply border-[1px] border-[#0c9cf0] bg-[#0c9cf0] text-white text-[13px] p-[10px] w-full;
}

.admin-edit-frame>.edit>button:hover {
  @apply border-[#0c9cf0] bg-transparent text-[#0c9cf0] duration-75;
}
</style>

<template>
  <div class="admin-edit-body">
    <NavigationBar />
    <div class="admin-edit-content">
      <span>Update Time In and Time Out</span>

      <div class="admin-edit-frame">
        <form class="edit">
          <span>Time In</span>
          <input type="string" required v-model="timeIn" />
          <span>Time Out</span>
          <input type="string" required v-model="timeOut" />

          <button @click="updateTime()">Update</button>
          <button @click="back()">Back</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import "/src/assets/tailwind.css"; // added

import NavigationBar from "@/components/NavigationBar.vue";
import Parse from "parse";

export default {
  data() {
    return {
      timeIn: "",
      timeOut: "",
    };
  },
  methods: {
    back() {
      this.$router.push("/dashboard");
    },
    async updateTime() {
      try {
        const TimeRecord = Parse.Object.extend("TimeRecord");
        const userId = this.$route.query.userId;
        const timeRecord = new TimeRecord();
        timeRecord.set("id", userId);
        timeRecord.set("timeIn", this.timeIn);
        timeRecord.set("timeOut", this.timeOut);
        timeRecord.save();

        alert("Successfully Edited Time Record");
        this.$router.push("/dashboard");
      } catch (error) {
        console.log(error.message);
      }
    },
  },
  mounted: async function () {
    try {
      const TimeRecord = Parse.Object.extend("TimeRecord");
      const query = new Parse.Query(TimeRecord);
      const userId = this.$route.query.userId;
      const entry = await query.get(userId);

      this.timeIn = entry.get("timeIn") ? entry.get("timeIn") : "";
      this.timeOut = entry.get("timeOut") ? entry.get("timeOut") : "";
    } catch (error) {
      console.log(error.message);
    }
  },
  components: { NavigationBar },
};
</script>
