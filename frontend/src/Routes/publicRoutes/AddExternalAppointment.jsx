import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNewAppointment, getAllDoctor, getAllPatient, getAllAppointment, getSingleDoctor, getAllConsultant, END_POINT } from '../../Redux/AdminReducer/action';
import CustomSpinner from '../../Components/CommonComponents/CustomSpinner';
import SelectInput from '../../Components/CommonComponents/SelectInput ';
import CustomInput from '../../Components/CommonComponents/CustomInput';
import CustomButton from '../../Components/CommonComponents/CustomButton';
import CustomBreadcrumbs from '../../Components/CommonComponents/CustomBreadcrumbs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CalenderAndTimeSlot from '../../Components/CommonComponents/CustomAppointmentDateCalender';
import axios from 'axios';
import CustomNameSuggestion from '../../Components/CommonComponents/CustomNameSuggestion';

const fetchItems = async (path) => {
  try {
    const result = await axios.get(`${END_POINT}/${path}`);
    return result;
  } catch (error) {
    console.log(error);
    toast.error('Something went wrong while fetching data');
  }
};

const initialState = {
  doctor: '',
  patient: '',
  bookTimeSlot: '',
  selectedRole: 'doctor',
  IsOnline: false,
  IsDoctor: true,
};

export default function AddAppointment() {
  const { addAppointmentMessage, addAppointmentFail, addAppointmentSuccess, addAppointmentProcessing, getAllPatientData, getAllPatientSuccess, getAllDoctorData, getAllPatientProcessing, getAllDoctorProcessing, getAllAppointmentData, getAllConsultantData, getAllConsultantProcessing } = useSelector((state) => state.AdminReducer);
  const [query, setQuery] = useState({ search: '', page: 1, pageSize: 200 });
  const [formData, setFormData] = useState(initialState);
  const [formError, setFormError] = useState(initialState);
  const [assistantDoctor, setAssistantDoctor] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      switch (formData?.selectedRole) {
        case 'consultant':
          dispatch(getAllConsultant(query));
          break;
        case 'assistantDoctor':
          try {
            fetchItems('assistantDoctor').then((e) => {
              setAssistantDoctor(e?.data);
            });
          } catch (error) {
            console.error('Error fetching assistant doctor:', error);
          }
          break;
        default:
          dispatch(getAllDoctor(query));
          dispatch(getAllPatient(query));
      }
    };

    fetchData();

    return () => {
      // Cleanup logic if needed
    };
  }, [formData?.selectedRole, query]);

  useEffect(() => {
    dispatch(getAllAppointment({ search: formData?.doctor?.id, page: 1, limit: 100 }));
  }, [formData?.doctor]);

  useEffect(() => {
    setFormData({ ...formData, availableSlot: '' });
  }, [formData.doctor?.id]);

  useEffect(() => {
    if (addAppointmentSuccess && !addAppointmentProcessing) {
      toast.success(addAppointmentMessage, { position: toast.POSITION.TOP_RIGHT });

      setFormData(initialState);
      setFormError(initialState);
    }
    if (addAppointmentFail && !addAppointmentProcessing) {
      toast.error(addAppointmentMessage, { position: toast.POSITION.TOP_RIGHT });
    }
  }, [addAppointmentProcessing]);

  const handelButtonClick = () => {
    let isValidInput = true;
    let updatedFormError = { formError };

    if (!formData.doctor?.name) {
      updatedFormError.doctor = `${formData?.selectedRole} Name is required!`;
      isValidInput = false;
    }
    //  validate patient name
    if (!formData.patient?.name) {
      updatedFormError.patient = 'Patient Name is required!';
      isValidInput = false;
    }

    // Validate date
    if (!formData.bookDate) {
      updatedFormError.bookDate = 'Date is required!';
      isValidInput = false;
    }

    //  validate doctor name
    if (!formData.bookTimeSlot._id) {
      updatedFormError.bookTimeSlot = 'time Slot is required!';
      isValidInput = false;
    }

    // Set role-specific properties
    if (formData.selectedRole === 'consultant') {
      formData.IsConsultant = true;
    } else {
      formData.IsConsultant = false;
    }

    if (formData.selectedRole === 'assistantDoctor') {
      formData.IsAssistantDoctor = true;
    } else {
      formData.IsAssistantDoctor = false;
    }

    if (formData.selectedRole === 'doctor') {
      formData.IsDoctor = true;
    } else {
      formData.IsDoctor = false;
    }
    formData.IsOnline = formData.IsOnline;

    setFormError(updatedFormError);
    console.log(updatedFormError, formData);

    if (isValidInput) {
      // dispatch(addNewAppointment(formData));
    }
  };

  useEffect(() => {
    let selectedDoctor;

    switch (formData?.selectedRole) {
      case 'consultant':
        selectedDoctor = getAllConsultantData;
        if (selectedDoctor?.length > 0) {
          console.log(selectedDoctor, 'the consuletnat');
          let { _id: consultantId, name: consultantName } = selectedDoctor?.[0];
          setFormData((prev) => ({ ...prev, doctor: { id: consultantId, name: consultantName } }));
        }
        break;

      case 'assistantDoctor':
        selectedDoctor = assistantDoctor;
        if (selectedDoctor?.length > 0) {
          let { _id: assistantId, name: assistantName } = selectedDoctor?.[0];
          setFormData((prev) => ({ ...prev, doctor: { id: assistantId, name: assistantName } }));
        }
        break;

      default:
        selectedDoctor = getAllDoctorData;
        if (selectedDoctor?.length > 0) {
          let { _id: defaultId, name: defaultName } = selectedDoctor?.[0] || {};
          setFormData((prev) => ({ ...prev, doctor: { id: defaultId, name: defaultName } }));
        }
    }
  }, [getAllDoctorData, getAllConsultantData, assistantDoctor, formData?.selectedRole]);

  return (
    <>
      <div className="h-fit min-h-[100vh] lg:px-24 w-full p-10 bg-white">
        {/* bread crumbs */}
        <CustomBreadcrumbs data={[{ title: 'Dashboard', url: '/dashboard' }, { title: 'Add Appointment' }]} />

        {getAllPatientProcessing || getAllDoctorProcessing || getAllConsultantProcessing || !getAllPatientSuccess ? (
          <CustomSpinner />
        ) : (
          <>
            <div className="bg-white pb-8 rounded-md pt-4 border-2 border-primary-400 ">
              {/* Personal Information */}
              <div className="px-6 py-6 rounded-md ">
                <h2 className="text-2xl font-semibold text-primary-900 border-l-4 border-primary-400 pl-3 ">Add Appointment </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 ">
                  {/* Select Role Dropdown */}
                  <SelectInput
                    options={[
                      { value: 'doctor', label: 'Doctor' },
                      { value: 'consultant', label: 'Consultant' },
                      { value: 'assistantDoctor', label: 'Assistant Doctor' },
                    ]}
                    value={formData.selectedRole}
                    onChange={(e) => setFormData((prev) => ({ ...prev, selectedRole: e.target.value }))}
                    placeholder="Select Role"
                    label={'Select Role'}
                    name={'selectedRole'}
                    error={formError.selectedRole}
                  />

                  {/* Online or Offline Checkbox */}
                  <div className="flex items-center mt-10">
                    <label className="mr-2">Online</label>
                    <input type="checkbox" checked={formData.IsOnline} onChange={() => setFormData((prev) => ({ ...prev, IsOnline: !prev.IsOnline }))} style={{ width: '1.5em', height: '1.5em' }} />
                  </div>

                  {/* Render doctor dropdown and calendar when role is Doctor */}
                  {formData.selectedRole === 'doctor' && (
                    <>
                      <SelectInput
                        options={getAllDoctorData.map((doctor) => ({
                          value: doctor._id,
                          label: doctor.name,
                        }))}
                        value={formData?.doctor?.id}
                        onChange={(e) => {
                          let selectedDoctor = getAllDoctorData?.filter((i) => i?._id == e.target.value)?.[0];
                          const { _id, name } = selectedDoctor;
                          setFormData((prev) => ({ ...prev, doctor: { id: _id, name: name } }));
                        }}
                        placeholder="Select Doctor"
                        label={'Select Doctor'}
                        name={'doctor'}
                        error={formError.doctor}
                      />
                    </>
                  )}

                  {formData.selectedRole === 'assistantDoctor' && (
                    <>
                      <SelectInput
                        options={assistantDoctor?.map((doctor) => ({
                          value: doctor._id,
                          label: doctor.name,
                        }))}
                        value={formData?.doctor?.id}
                        onChange={(e) => {
                          let selectedDoctor = assistantDoctor?.filter((i) => i?._id == e.target.value)?.[0];
                          const { _id, name } = selectedDoctor;
                          setFormData((prev) => ({ ...prev, doctor: { id: _id, name: name } }));
                        }}
                        placeholder="Select Assistant Doctor"
                        label={'Select Assistant Doctor'}
                        name={'doctor'}
                        error={formError.doctor}
                      />
                    </>
                  )}

                  {/* Render consultant dropdown and calendar when role is Consultant */}
                  {formData.selectedRole === 'consultant' && getAllConsultantData?.length > 0 && (
                    <>
                      <SelectInput
                        options={getAllConsultantData?.map((consultant) => ({
                          value: consultant._id,
                          label: consultant.name,
                        }))}
                        value={formData?.doctor?.id}
                        onChange={(e) => {
                          let selectedDoctor = getAllConsultantData?.filter((i) => i?._id == e.target.value)?.[0];
                          const { _id, name } = selectedDoctor;
                          setFormData((prev) => ({ ...prev, doctor: { id: _id, name: name } }));
                        }}
                        placeholder="Select Consultant"
                        label={'Select Consultant'}
                        name={'doctor'}
                        error={formError.Consultant}
                      />
                    </>
                  )}

                  {/* <CustomInput
                    label="Patient Name"
                    placeholder="Enter Patient Name"
                    onChange={(e) => {
                      
                    }}
                    value={formData?.patient?.name}
                    type="text"
                    name="patientName"
                    error={formError?.patient?.name}
                  /> */}
                  <CustomNameSuggestion
                    onChange={(e) => {
                      let selectedPatient = getAllPatientData?.filter((p) => `${p?.firstName} ${p?.surname}` == e.target.value)?.[0];
                      if (selectedPatient !== undefined) {
                        setFormData((prev) => ({ ...prev, patient: { id: selectedPatient?._id, name: selectedPatient?.firstName, phone: selectedPatient?.mobile, surname: selectedPatient?.surname } }));
                      } else {
                        setFormData((prev) => ({ ...prev, patient: { name: e.target.value } }));
                      }
                    }}
                    options={getAllPatientData?.map((p) => `${p?.firstName} ${p?.surname}`)}
                    label={'Patient'}
                    value={getAllPatientData?.filter((p) => p?._id == formData?.patient?.id)?.[0]?.firstName}
                    error={formError?.patient?.name}
                    name="name"
                    placeholder="-- Select Or Enter Patient --"
                  />
                  {formData?.patient?.phone?.length >= 10 && (
                    <CustomInput
                      label="Patient Contact"
                      placeholder="Enter Contact Number"
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, patient: { ...prev.patient, phone: e.target.value } }));
                      }}
                      value={formData?.patient.phone}
                      type="text"
                      name="phoneNumber"
                      error={formError?.patient?.phone}
                    />
                  )}
                </div>

                {formData.selectedRole === 'doctor' && <CalenderAndTimeSlot selectedDoctor={getAllDoctorData?.length > 0 && getAllDoctorData?.filter((doctor) => doctor._id == formData?.doctor?.id)} formData={formData} setFormData={setFormData} getAllAppointmentData={getAllAppointmentData} />}
                {formData.selectedRole === 'consultant' && <CalenderAndTimeSlot selectedDoctor={getAllConsultantData?.length > 0 && getAllConsultantData?.filter((consultant) => consultant._id == formData?.doctor?.id)} formData={formData} setFormData={setFormData} getAllAppointmentData={getAllAppointmentData} />}
                {formData.selectedRole === 'assistantDoctor' && <CalenderAndTimeSlot selectedDoctor={assistantDoctor?.length > 0 && assistantDoctor?.filter((assistantDoctor) => assistantDoctor._id == formData?.doctor?.id)} formData={formData} setFormData={setFormData} getAllAppointmentData={getAllAppointmentData} />}
              </div>

              {/* handel add appointment  */}
              <div className="lg:w-80 mx-auto w-full px-5  ">
                <CustomButton isProcessing={addAppointmentProcessing} onClick={handelButtonClick} label="Add Appointment" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* toast message  */}
      <ToastContainer />
    </>
  );
}
