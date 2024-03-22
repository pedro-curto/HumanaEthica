describe('Assessment', () => {
    beforeEach(() => {
        cy.deleteAllButArs();
        cy.createEntitiesForAssessmentTesting();
    });

    afterEach(() => {
        cy.deleteAllButArs();
    });

    it('assessActivityAndCheck', () => {
        const REVIEW = 'Assessment demo review';
        // ------------ VOLUNTEER TEST ------------
        cy.demoVolunteerLogin();
        // go to activities view
        // intercepts necessary POST and GET requests
        cy.intercept('POST', '/institutions/*/assessments', (req) => {
            req.body = {
                review: REVIEW
            };
        }).as('createAssessment');
        cy.intercept('GET', '/users/getParticipations').as('getParticipations');
        cy.intercept('GET', '/activities').as('getActivities');
        cy.intercept('GET', '/users/getAssessments').as('getAssessments');
        // go to volunteer activities view
        cy.get('[data-cy="volunteerActivities"]').click();
        // waits for the GET requests
        cy.wait('@getParticipations');
        cy.wait('@getActivities');
        cy.wait('@getAssessments');
        // verify that the activity table has 6 instances
        cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
            .should('have.length', 6);
        // verify that the first activity has the name "A1"
        cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
            .eq(0)
            .children()
            .eq(0)
            .should('contain', "A1");

        cy.logout();


    });
});