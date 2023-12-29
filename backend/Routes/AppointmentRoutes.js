const express = require('express');
const { createAppointment, getAppointment, updateStatusAppointment, getFilteredAppointment, updateAppointment } = require('../Controllers/AppointmentController');
const { getAppointment_External } = require('../Controllers/Public/ExternalAppointmentController');


const router = express.Router();

router.route("/").post(createAppointment);
router.route("/").get(getAppointment);
router.route("/getFiltered").post(getFilteredAppointment);
router.route("/:appointmentId").put(updateStatusAppointment);
router.route('/reSchedule/:appointmentId').put(updateAppointment)


router.route("/external").get(getAppointment_External)

module.exports = router