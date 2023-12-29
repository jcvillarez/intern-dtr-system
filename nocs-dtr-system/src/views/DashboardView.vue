<template>
  <NavigationBar />
  <DailyTimeRecorder />
</template>

<script>
import DailyTimeRecorder from '@/components/DailyTimeRecorder.vue';
import NavigationBar from '@/components/NavigationBar.vue';

export default {
  name: 'DashboardView',
  components: {
    DailyTimeRecorder,
    NavigationBar
  },
};
</script>