const express = require('express');
const router = express.Router()
const mailContactUs = require('../Controller/mailOps')
const userController = require('../Controller/userController')
// const { validateToken } = require('../Controller/jwtTokens')
// const { authPage } = require('../Controller/authRole')
const expertController = require('../Controller/expertManagementController')
const projectController = require('../Controller/projectManagementController');
const projectMatchingController = require('../Controller/projectMatchingController')
const pswOps = require('../Controller/pwdOps');


//mailing router
router.post('/hyde_international/contactus', mailContactUs.mailSending);

//home job list 
router.get('/hyde_international/jobList', projectController.jobList)
router.get('/hyde_international/jobList/:jobId', projectController.jobListId)

//authorization and authentication router
router.post('/hyde_international/signup', userController.register)
router.post('/hyde_international/login', userController.login)
router.get('/hyde_international/login', userController.isloggedIn)
router.get('/hyde_international/fetchExpertData', expertController.fetchExpertData)
router.get('/hyde_international/fetchProjectData', projectController.fetchProjectData)
router.get('/hyde_international/logout', userController.logout)


//expert router
router.post('/hyde_international/addExpert', expertController.createExpertData)
router.put('/hyde_international/editExpert', expertController.editExpertData)

router.delete('/hyde_international/deleteExpert/:expertId', expertController.deleteExpert)

router.get('/hyde_international/download_Expert/:expertID', expertController.downloadExpertDoc)


//project router
router.post('/hyde_international/addProject', projectController.createProjectData)
router.put('/hyde_international/editProject', projectController.editProject)
router.get('/category/:jobCategory', projectController.sortByCategory)

router.delete('/hyde_international/deleteProject/:projectId', projectController.deleteProject)

router.get('/hyde_international/download_Project/:projectID', projectController.downloadProjectDoc)

//profile router
router.get('/hyde_international/profile', userController.profile)
router.put('/hyde_international/updateprofile', userController.updateProfile)

//project matching router 
router.post('/hyde_international/applyJob/:jobId', projectMatchingController.expertJobApply)
router.get('/hyde_international/fetchProjectMacthing', projectMatchingController.fetcProjectMatching)
router.get('/hyde_international/fetchProjectMacthing/:projectid', projectMatchingController.fetchProjectExpert)
router.delete('/hyde_international/deleteProjectMacthing/:projectId/:expertId', projectMatchingController.deleteProjectMatching)
router.get('/hyde_international/fetchProfile_projectMatching/expertJob', projectMatchingController.fetchExpertJob)


//pasword router
router.post('/hyde_international/forgotPass', pswOps.forgotPassword);
router.post('/hyde_international/resetPassword/:token', pswOps.resetPassword);
router.post('/hyde_international/updatePassword', pswOps.updatePassword);



module.exports = router
