/*
 Not sure about this, need to make other tests first:

  describe('Volunteer', () => {
  beforeEach(() => {
    cy.demoVolunteerLogin()
  });

  afterEach(() => {
    cy.logout();
  });

  it('apply to the first activity', () => {
    // intercept get activities request
    cy.intercept('GET', '/activities').as('getActivities');
    // go to volunteer activities view
    cy.get('[data-cy="volunteerActivities"]').click();
    // check request was done
    cy.wait('@getActivities');
    // select the first activity
    cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
      .eq(0).children().eq(0).click();
    // intercept post apply to activity request
    cy.intercept('POST', '/activities/*/ /*apply').as('applyToActivity');
    // click on apply button
    cy.get('[data-cy="applyButton"]').click();
    // not sure about this part here
    cy.get('[data-cy="submitApplication"]').click();
    // check if the application was successful
    cy.wait('@applyToActivity');
  });
}); */
