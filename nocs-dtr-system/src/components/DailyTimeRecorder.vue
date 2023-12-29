<template>
  <div class="time-tracking-app">
    <div class="time-section">
      <button @click="timeInMorning" class="time-button" :disabled="timeInDisabled">
        Time In
      </button>
      <button @click="timeOutMorning" class="time-button" :disabled="timeOutDisabled">
        Time Out
      </button>
      <button @click="calculateOverallTotalTime" class="time-button">
        Total Time (Overall)
      </button>
      <div class="time-table-container">
        <table class="time-table">
          <thead>
            <tr>
              <th colspan="5" class="table-title">Daily Time Record</th>
            </tr>
            <tr>
              <th>Date</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Duration</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in displayedRecords" :key="record.id">
              <td>{{ record.date }}</td>
              <td>{{ record.timeIn }}</td>
              <td>{{ record.timeOut }}</td>
              <td> {{ record.totalTime }}</td>
              <td>
                <button @click="updateRecord()" class="action-button update-button">
                  Update
                </button>
                <button @click="deleteRecord(record.id)" class="action-button delete-button">
                  Delete
                </button>
              </td>
            </tr>
            <br>
          </tbody>
          <tfoot>
            <tr>
              <th>Overall Total Time</th>
              <th colspan="1"></th>
              <th colspan="1"></th>
              <th colspan="1"></th>
              <th>{{ overallTotalTime }}</th>
            </tr>
          </tfoot>
        </table>
      </div>
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <button @click="nextPage" :disabled="currentPage * perPage >= morningTimeRecords.length">Next</button>
      </div>
    </div>
  </div>
</template>

<script>
import "/src/assets/tailwind.css"; // added
import Parse from "parse";

function parseTime(timeString) {
  const validTimeRegex = /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;

  if (validTimeRegex.test(timeString)) {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':');
    let hoursInt = parseInt(hours);

    if (period === 'PM' && hoursInt !== 12) {
      hoursInt += 12;
    } else if (period === 'AM' && hoursInt === 12) {
      hoursInt = 0;
    }

    const date = new Date();
    date.setHours(hoursInt, parseInt(minutes), 0, 0);

    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return null;
}

export default {
  data() {
    return {
      morningTimeRecords: [],
      overallTotalTime: "",
      currentPage: 1,
      perPage: 10,
      timeOutDisabled: false,
      timeInDisabled: false,
    };
  },
  computed: {
    morningTimeRecordsWithTotal() {
      return this.morningTimeRecords.map((record) => {
        const timeIn = parseTime(record.timeIn);
        const timeOut = parseTime(record.timeOut);
        const timeDifference = (timeOut - timeIn) / 1000; // Convert to seconds
        const hours = Math.floor(timeDifference / 3600);
        const minutes = Math.floor((timeDifference % 3600) / 60);
        const totalTime = `${hours} hours ${minutes.toString().padStart(2, "0")} minutes`;
        return {
          ...record,
          totalTime,
        };
      });
    },
    displayedRecords() {
      const startIndex = (this.currentPage - 1) * this.perPage;
      const endIndex = startIndex + this.perPage;
      return this.morningTimeRecordsWithTotal.slice(startIndex, endIndex).map(record => {
        return {
          ...record,
          timeOut: record.timeOut, // Display the updated "Time In" record in the "Time Out" column
          totalTime: record.timeOut ? record.totalTime : '', // Display the duration if Time Out is recorded
        };
      });
    },
  },
  methods: {
    timeInMorning() {
      const TimeRecord = Parse.Object.extend("TimeRecord");
      const timeRecord = new TimeRecord();

      const now = new Date();
      const formattedTimeIn = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const formattedDate = now.toLocaleDateString();

      timeRecord.set("type", "Time In");
      timeRecord.set("user", Parse.User.current());
      timeRecord.set("date", formattedDate);
      timeRecord.set("timeIn", formattedTimeIn);
      timeRecord.save().then(async () => {
        const currentUser = Parse.User.current();
        const TimeRecord = Parse.Object.extend("TimeRecord");
        const query = new Parse.Query(TimeRecord)
        query.equalTo("user", currentUser);
        const result = await query.find();
        const count = await query.count();

        this.morningTimeRecords.unshift({ // Adding the new record to the array
          id: result[0].id,
          date: formattedDate, // Adding the formatted date
          timeIn: formattedTimeIn, // Adding the formatted time
          timeOut: '',
        });

        for (let i = 0; i < count; i++) {
          this.$router.push({
            name: "DashboardView",
            query: { objectId: result[i].id },
          });
        }
      });
      this.timeInDisabled = true;
      localStorage.setItem("timeInDisabled", "true");
    },
    timeOutMorning() {
      const TimeRecord = Parse.Object.extend("TimeRecord");
      const objectId = this.$route.query.objectId;

      const query = new Parse.Query(TimeRecord);
      query.get(objectId).then(async (timeRecord) => {
        const now = new Date();
        const formattedTimeOut = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        timeRecord.set("timeOut", formattedTimeOut);
        await timeRecord.save();

        // Update the corresponding record in the morningTimeRecords array
        const recordIndex = this.morningTimeRecords.findIndex(record => record.id === objectId);
        if (recordIndex !== -1) {
          this.morningTimeRecords[recordIndex].timeOut = formattedTimeOut;
        }
      }).catch(error => {
        console.error('Error updating time out:', error);
      });

      this.timeOutDisabled = true;
      localStorage.removeItem("timeInDisabled");
    },
    calculateOverallTotalTime() {
      const totalSeconds = this.morningTimeRecordsWithTotal.reduce(
        (total, record) => {
          const totalTimeComponents = record.totalTime.split(" ");
          const hours = parseInt(totalTimeComponents[0]) || 0;
          const minutes = parseInt(totalTimeComponents[2]) || 0;
          return total + hours * 3600 + minutes * 60;
        },
        0
      );

      const overallHours = Math.floor(totalSeconds / 3600);
      const overallMinutes = Math.floor((totalSeconds % 3600) / 60);
      this.overallTotalTime = `${overallHours} hours ${overallMinutes
        .toString()
        .padStart(2, "0")} minutes`;
    },
    async updateRecord() {
      const password = prompt("Please enter admin password to continue.");

      if (password == "nocs2023") {
        const currentUser = Parse.User.current();
        const TimeRecord = Parse.Object.extend("TimeRecord");
        const query = new Parse.Query(TimeRecord);
        query.equalTo("user", currentUser);
        const timeRecordResult = await query.find();
        const count = await query.count();

        for (let i = 0; i < count; i++) {
          this.$router.push({
            name: "UpdateTimeRecord",
            query: { userId: timeRecordResult[i].id },
          });
        }
      } else if (password == null) {
        return;
      } else {
        alert("Wrong Password");
      }
    },
    async deleteRecord(recordId) {
      const confirmed = confirm(
        "Are you sure you want to delete this record? This action cannot be undone."
      );
      if (confirmed) {
        try {
          const TimeRecord = Parse.Object.extend("TimeRecord");
          const query = new Parse.Query(TimeRecord);
          const record = await query.get(recordId);
          await record.destroy();
          this.morningTimeRecords = this.morningTimeRecords.filter(
            (record) => record.id !== recordId
          );
        } catch (error) {
          console.log(error.message);
        }
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      const totalPages = Math.ceil(this.morningTimeRecordsWithTotal.length / this.perPage);
      if (this.currentPage < totalPages) {
        this.currentPage++;
      } else if (this.morningTimeRecordsWithTotal.length === this.currentPage * this.perPage) {
        this.currentPage++;
      }
    },
  },
  mounted: async function () {
    const currentUser = Parse.User.current();
    const TimeRecord = Parse.Object.extend("TimeRecord");
    const query = new Parse.Query(TimeRecord);
    query.equalTo("user", currentUser);
    const result = await query.find();
    const count = await query.count();

    for (let i = 0; i < count; i++) {
      this.morningTimeRecords.unshift({
        id: result[i].id,
        date: result[i].get("date"),
        timeIn: result[i].get("timeIn"),
        timeOut: result[i].get("timeOut"),
      })
    }
    const hasTimeInDisabled = localStorage.getItem("timeInDisabled");
    if (hasTimeInDisabled) {
      this.timeInDisabled = true;
    }
  },
};
</script>

<style scoped>
.time-tracking-app {
  font-family: Arial, sans-serif;
  display: flex;
  justify-content: space-between;
  padding: 60px 20px 20px;
}

.time-section {
  flex: 1;
  margin-right: 20px;
}

.time-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  border-radius: 4px;
}

.time-button.active {
  background-color: #0056b3;
}

.time-button[disabled]:hover {
  cursor: not-allowed;
}

.time-table-container {
  margin-top: 20px;
}

.time-table {
  border-collapse: collapse;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.time-table th,
.time-table td {
  padding: 12px;
  text-align: center;
}

.time-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.table-title {
  font-size: 20px;
}

.action-button {
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
  margin-right: 8px;
  border-radius: 4px;
}

.update-button {
  background-color: #28a745;
  color: white;
}

.update-button:hover {
  background-color: #218838;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.delete-button:hover {
  background-color: #c82333;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.pagination button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  margin: 0 5px;
  cursor: pointer;
  border-radius: 4px;
}

.pagination button[disabled] {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>