<template>
  <v-dialog v-model="dialog" persistent width="1300">
    <v-card>
      <v-card-title>New Assessment</v-card-title>
      <v-card-text>
        <v-form ref="form" lazy-validation>
          <v-text-field
            v-model="newAssessment.review"
            :rules="[(v) => isReviewLongEnough(v) || 'Review must be at least 10 characters long',]"
            label="Review"
            required
            data-cy="reviewField"
          ></v-text-field>
          <v-card-actions>
            <v-spacer></v-spacer>
          <v-btn
              :disabled="!(newAssessment.review && newAssessment.review.length >= 10)"
              class="white--text"
              color="orange"
              @click="submit"
              data-cy="saveButton"
            >Save</v-btn>
          <v-btn
              color="blue-darken-1"
              variant="text"
              @click="$emit('close-assessment-dialog')"
          >Close</v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {Vue, Component, Prop, Model} from 'vue-property-decorator';
import Assessment from '@/models/assessment/Assessment';
import Institution from '@/models/institution/Institution';
import RemoteServices from '@/services/RemoteServices';

@Component({})
export default class AssessmentDialog extends Vue {
  @Model('dialog', Boolean) dialog!: boolean;
  @Prop({ type: Number, required: true }) readonly institutionId!: number;
  newAssessment: Assessment = new Assessment();

  async created() {
    this.newAssessment.institutionId = this.institutionId;
    this.newAssessment.volunteerName = this.$store.getters.getUser.name;
  }

  async submit() {
    if ((this.$refs.form as Vue & { validate: () => boolean }).validate()) {
      try {
        const result = await RemoteServices.submitAssessment(this.newAssessment);
        this.$emit('save-assessment', result);
      } catch (error) {
        await this.$store.dispatch('error', error);
      }
    }
  }

  isReviewLongEnough(review: string) {
    return review && review.length >= 10;
  }

}
</script>
<style scoped lang="scss"></style>