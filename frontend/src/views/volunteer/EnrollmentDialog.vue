<template>
  <v-dialog v-model="dialog" persistent width="1300">
    <v-card>
      <v-card-title>
        <span class="headline">
          New Enrollment
        </span>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" lazy-validation>
          <v-textarea
              v-model="newEnrollment.motivation"
              :rules="[v => !!v || 'Motivation is required', v => (v && v.length >= 10) || 'Motivation must be at least 10 characters']"
              label="Motivation"
              data-cy="motivationInput"
              required
          ></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            color="blue-darken-1"
            variant="text"
            @click="$emit('close-enrollment-dialog')"
        >
          Close
        </v-btn>
        <v-btn :disabled='!isMotivationValid(newEnrollment.motivation)'
            color="blue-darken-1"
            variant="text"
            @click="updateEnrollment"
            data-cy="saveEnrollment"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { Vue, Component, Prop, Model } from 'vue-property-decorator';
import Enrollment from '@/models/enrollment/Enrollment';
import RemoteServices from '@/services/RemoteServices';
import Activity from '@/models/activity/Activity';

@Component
export default class EnrollmentDialog extends Vue {
  @Model('dialog', Boolean) dialog!: boolean;
  @Prop({ type: Enrollment, required: true }) readonly enrollment!: Enrollment;
  @Prop({ type: Activity, required: true }) readonly activity!: Activity;

  newEnrollment: Enrollment = new Enrollment();

  cypressCondition: boolean = false;

  async created() {
    this.newEnrollment = new Enrollment(this.enrollment);
  }

  get canSave(): boolean {
    return this.cypressCondition || (!!this.newEnrollment.motivation && this.newEnrollment.motivation.length >= 10);
  }

  isMotivationValid(motivation: string): boolean {
    return !!motivation && motivation.length >= 10;
  }

  async updateEnrollment() {
    if ((this.$refs.form as any).validate()) {
      try {
        const result = await RemoteServices.registerEnrollment(this.$store.getters.getUser.id, this.activity, this.newEnrollment);
        this.$emit('save-enrollment', result);
      } catch (error) {
        await this.$store.dispatch('error', error);
      }
    }
  }
}
</script>

<style scoped lang="scss"></style>