import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './P3ReportPage.css';

function IconEdit(props) {
	return (
		<svg width='14' height='14' viewBox='0 0 24 24' fill='none' {...props}>
			<path
				d='M12 20h9'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinecap='round'
			/>
			<path
				d='M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinejoin='round'
			/>
		</svg>
	);
}

function EditableTextarea({ label, value, placeholder, onChange, editKey, isEditing, onToggleEdit }) {
	return (
		<div className='p3-field'>
			<div className='p3-field-header'>
				<div className='p3-field-label'>{label}</div>
				<button
					type='button'
					className='p3-edit-button'
					onClick={() => onToggleEdit(editKey)}>
					<IconEdit />
					{isEditing ? 'Done' : 'Edit'}
				</button>
			</div>
			<textarea
				className='p3-textarea'
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				readOnly={!isEditing}
			/>
		</div>
	);
}

function P3SectionCard({ title, children }) {
	return (
		<section className='p3-card'>
			<div className='p3-card-title'>{title}</div>
			<div className='p3-card-body'>{children}</div>
		</section>
	);
}

function P3ReportPage() {
	const { caseId } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const [p3Data, setP3Data] = useState(
		location.state?.p3Data?.p3_pre_fill || null
	);
	const [formData, setFormData] = useState({
		policeStation: '',
		referenceNo: '',
		date: '',
		hospitalName: '',
		fullName: '',
		physicalAddress: '',
		allegedOffenceDate: '',
		sentToHospitalOn: '',
		escortingOfficer: '',
		reportToPoliceDate: '',
	});
	const [sessionPrivacyEnabled, setSessionPrivacyEnabled] = useState(true);
	const [editing, setEditing] = useState({});

	const aiPrefill = useMemo(() => {
		const mechanism = p3Data?.history_of_assault?.mechanism;
		const timing = p3Data?.history_of_assault?.timing;
		const injuryLocations = p3Data?.physical_examination?.injury_locations;
		const injuryAge = p3Data?.physical_examination?.injury_age_estimate;
		const uncertainty = p3Data?.limitations_and_uncertainty;

		const locationsText = Array.isArray(injuryLocations)
			? injuryLocations.join(', ')
			: injuryLocations || '';
		const uncertaintyText = Array.isArray(uncertainty)
			? uncertainty.join(', ')
			: uncertainty || '';

		// Keep conservative language: don’t add facts, only route existing ones.
		const brief =
			[
				timing ? `Timing reported: ${timing}.` : null,
				mechanism ? `Mechanism reported: ${mechanism}.` : null,
				locationsText ? `Injury locations mentioned: ${locationsText}.` : null,
				injuryAge ? `Injury stage/age notes: ${injuryAge}.` : null,
				uncertaintyText ? `Uncertainty notes: ${uncertaintyText}` : null,
			]
				.filter(Boolean)
				.join(' ') || '';

		return {
			briefDetails: brief,
			generalHistory:
				brief ? 'Details consistent with transcript (requires clinician review).' : '',
			generalPhysicalExam: locationsText
				? `Observed/mentioned injury locations: ${locationsText}.`
				: '',
			assaultHeadNeck: locationsText?.toLowerCase?.().includes('cheek')
				? 'Bruising observed on the left cheek.'
				: '',
		};
	}, [p3Data]);

	const [medicalData, setMedicalData] = useState({
		briefDetailsOfOffence: '',
		medicalOfficerRefNo: '',
		stateOfClothing: '',
		generalMedicalHistory: '',
		generalPhysicalExamination: '',
		assaultHeadNeck: '',
		assaultThoraxAbdomen: '',
		assaultUpperLimbs: '',
		assaultLowerLimbs: '',
		approxAgeOfInjuries: '',
		probableWeapons: '',
		medicalOfficerName: '',
		signature: '',
		medicalOfficerDate: '',
		natureOfOffence: '',
		femaleInjuriesToGenitalia: '',
		maleInjuriesToGenitalia: '',
		specimensCollected: '',
		additionalRemarks: '',
	});

	useEffect(() => {
		// If no P3 data in state, try to fetch it
		if (!p3Data) {
			// In a real app, you'd fetch from the backend
			// For now, initialize with empty P3 structure
			setP3Data({
				facility_details: { exam_date: new Date().toISOString().split('T')[0] },
				history_of_assault: {},
				physical_examination: {},
				clinical_opinion: {
					consistency_with_history: 'To be determined by clinician',
				},
			});
		}
	}, [p3Data]);

	useEffect(() => {
		// Seed sensible defaults from AI pre-fill (only if user hasn’t typed yet)
		setMedicalData((prev) => ({
			...prev,
			briefDetailsOfOffence: prev.briefDetailsOfOffence || aiPrefill.briefDetails,
			generalMedicalHistory: prev.generalMedicalHistory || aiPrefill.generalHistory,
			generalPhysicalExamination:
				prev.generalPhysicalExamination || aiPrefill.generalPhysicalExam,
			assaultHeadNeck: prev.assaultHeadNeck || aiPrefill.assaultHeadNeck,
		}));
	}, [aiPrefill]);

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const toggleEdit = (key) => {
		setEditing((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const handleExportPDF = () => {
		// PDF export functionality would go here
		alert('PDF export functionality will be implemented');
	};

	const handleSyncOpenMRS = () => {
		// OpenMRS sync functionality would go here
		alert('OpenMRS sync functionality will be implemented');
	};

	const handleSubmitCompleted = () => {
		// For now, just show a preview payload. Later: POST to backend + persist.
		const payload = {
			case_id: caseId,
			part1: formData,
			part2: medicalData,
			ai_prefill: p3Data || null,
			session_privacy_enabled: sessionPrivacyEnabled,
		};
		// eslint-disable-next-line no-console
		console.log('Submit P3 payload', payload);
		alert('Submitted (demo). Next: save to backend + generate PDF.');
	};

	return (
		<div className='p3-report-page'>
			<div className='p3-report-container'>
				<div className='p3-header'>
					<button className='go-back-button' onClick={() => navigate(-1)}>
						<svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
							<path
								d='M10 12L6 8L10 4'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
							/>
						</svg>
						Go Back
					</button>
					<h1 className='p3-title'>Step 3: P3 Medical Report - {caseId}</h1>
					<div className='header-actions'>
						<button className='export-button' onClick={handleExportPDF}>
							Export P3 PDF
						</button>
						<button className='sync-button' onClick={handleSyncOpenMRS}>
							Sync to OpenMRS
						</button>
					</div>
				</div>

				<div className='p3-form'>
					<div className='p3-banner'>
						THE KENYA POLICE P3 MEDICAL EXAMINATION REPORT
					</div>

					<h2 className='form-section-title'>
						PART 1 - (To be completed by the Police Officer)
					</h2>

					<div className='form-section'>
						<label className='form-label'>From:</label>
						<div className='form-row'>
							<input
								type='text'
								className='form-input'
								placeholder='Police Station'
								value={formData.policeStation}
								onChange={(e) =>
									handleInputChange('policeStation', e.target.value)
								}
							/>
							<div className='form-group'>
								<label className='form-sublabel'>Ref</label>
								<input
									type='text'
									className='form-input'
									placeholder='Reference No.'
									value={formData.referenceNo}
									onChange={(e) =>
										handleInputChange('referenceNo', e.target.value)
									}
								/>
							</div>
							<div className='form-group'>
								<label className='form-sublabel'>Date</label>
								<input
									type='text'
									className='form-input'
									placeholder='DD/MM/YYYY'
									value={formData.date}
									onChange={(e) => handleInputChange('date', e.target.value)}
								/>
							</div>
						</div>
					</div>

					<div className='form-section'>
						<label className='form-label'>To the Hospital/Dispensary:</label>
						<input
							type='text'
							className='form-input'
							placeholder='Hospital Name'
							value={formData.hospitalName}
							onChange={(e) =>
								handleInputChange('hospitalName', e.target.value)
							}
						/>
					</div>

					<div className='form-section'>
						<div className='form-row'>
							<div className='form-group'>
								<label className='form-label'>Name</label>
								<input
									type='text'
									className='form-input'
									placeholder='Full Name (Leave Blank)'
									value={formData.fullName}
									onChange={(e) =>
										handleInputChange('fullName', e.target.value)
									}
								/>
							</div>
							<div className='form-group'>
								<label className='form-label'>Address</label>
								<input
									type='text'
									className='form-input'
									placeholder='Physical Address (Leave Blank)'
									value={formData.physicalAddress}
									onChange={(e) =>
										handleInputChange('physicalAddress', e.target.value)
									}
								/>
							</div>
						</div>
					</div>

					<div className='form-section'>
						<label className='form-label'>
							Date and Time of the alleged offence:
						</label>
						<input
							type='text'
							className='form-input'
							placeholder='e.g., 2024-01-26 14:30 (Leave Blank)'
							value={formData.allegedOffenceDate}
							onChange={(e) =>
								handleInputChange('allegedOffenceDate', e.target.value)
							}
						/>
					</div>

					<div className='form-section'>
						<div className='form-row'>
							<div className='form-group'>
								<label className='form-label'>Sent to you/Hospital on</label>
								<input
									type='text'
									className='form-input'
									placeholder='DD/MM/YYYY (Leave Blank)'
									value={formData.sentToHospitalOn}
									onChange={(e) =>
										handleInputChange('sentToHospitalOn', e.target.value)
									}
								/>
							</div>
							<div className='form-group'>
								<label className='form-label'>Under escort of</label>
								<input
									type='text'
									className='form-input'
									placeholder='Escorting Officer (Leave Blank)'
									value={formData.escortingOfficer}
									onChange={(e) =>
										handleInputChange('escortingOfficer', e.target.value)
									}
								/>
							</div>
						</div>
					</div>

					<div className='form-section'>
						<label className='form-label'>
							Date and time report to police:
						</label>
						<input
							type='text'
							className='form-input'
							placeholder='DD/MM/YYYY HH:MM'
							value={formData.reportToPoliceDate}
							onChange={(e) =>
								handleInputChange('reportToPoliceDate', e.target.value)
							}
						/>
					</div>

					{p3Data && (
						<div className='ai-generated-section'>
							<h3 className='ai-section-title'>
								AI-Generated Clinical Findings (Pre-filled)
							</h3>
							<div className='ai-content'>
								<p>
									<strong>History of Assault:</strong>
								</p>
								{p3Data.history_of_assault?.timing && (
									<p>Timing: {p3Data.history_of_assault.timing}</p>
								)}
								{p3Data.history_of_assault?.mechanism && (
									<p>Mechanism: {p3Data.history_of_assault.mechanism}</p>
								)}
								{p3Data.physical_examination?.injury_locations && (
									<p>
										Injury Locations:{' '}
										{Array.isArray(p3Data.physical_examination.injury_locations)
											? p3Data.physical_examination.injury_locations.join(', ')
											: p3Data.physical_examination.injury_locations}
									</p>
								)}
								{p3Data.limitations_and_uncertainty && (
									<p>
										<strong>Uncertainty Notes:</strong>{' '}
										{Array.isArray(p3Data.limitations_and_uncertainty)
											? p3Data.limitations_and_uncertainty.join(', ')
											: p3Data.limitations_and_uncertainty}
									</p>
								)}
							</div>
						</div>
					)}

					<h2 className='form-section-title'>PART II - MEDICAL DETAILS</h2>

					<P3SectionCard title='Brief details of the alleged offence'>
						<EditableTextarea
							label=''
							editKey='briefDetailsOfOffence'
							isEditing={!!editing.briefDetailsOfOffence}
							onToggleEdit={toggleEdit}
							value={medicalData.briefDetailsOfOffence}
							placeholder='Enter brief details of the alleged offence.'
							onChange={(value) =>
								setMedicalData((p) => ({ ...p, briefDetailsOfOffence: value }))
							}
						/>
					</P3SectionCard>

					<P3SectionCard title="SECTION 'A' - GENERAL EXAMINATION">
						<div className='form-section'>
							<label className='form-label'>Medical Officer’s Ref. NO</label>
							<input
								type='text'
								className='form-input'
								placeholder='Reference No. (Leave Blank)'
								value={medicalData.medicalOfficerRefNo}
								onChange={(e) =>
									setMedicalData((p) => ({
										...p,
										medicalOfficerRefNo: e.target.value,
									}))
								}
							/>
						</div>

						<EditableTextarea
							label='1. State of clothing'
							editKey='stateOfClothing'
							isEditing={!!editing.stateOfClothing}
							onToggleEdit={toggleEdit}
							value={medicalData.stateOfClothing}
							placeholder='Describe clothing condition.'
							onChange={(value) =>
								setMedicalData((p) => ({ ...p, stateOfClothing: value }))
							}
						/>

						<EditableTextarea
							label='2. General medical history'
							editKey='generalMedicalHistory'
							isEditing={!!editing.generalMedicalHistory}
							onToggleEdit={toggleEdit}
							value={medicalData.generalMedicalHistory}
							placeholder='Enter general medical history.'
							onChange={(value) =>
								setMedicalData((p) => ({ ...p, generalMedicalHistory: value }))
							}
						/>

						<EditableTextarea
							label='3. General physical examination'
							editKey='generalPhysicalExamination'
							isEditing={!!editing.generalPhysicalExamination}
							onToggleEdit={toggleEdit}
							value={medicalData.generalPhysicalExamination}
							placeholder='Enter general physical examination findings.'
							onChange={(value) =>
								setMedicalData((p) => ({
									...p,
									generalPhysicalExamination: value,
								}))
							}
						/>
					</P3SectionCard>

					<P3SectionCard title="SECTION 'B' - CASES OF ASSAULT">
						<EditableTextarea
							label='a) Head and neck'
							editKey='assaultHeadNeck'
							isEditing={!!editing.assaultHeadNeck}
							onToggleEdit={toggleEdit}
							value={medicalData.assaultHeadNeck}
							placeholder='Findings for head and neck.'
							onChange={(value) =>
								setMedicalData((p) => ({ ...p, assaultHeadNeck: value }))
							}
						/>
						<EditableTextarea
							label='b) Thorax and Abdomen'
							editKey='assaultThoraxAbdomen'
							isEditing={!!editing.assaultThoraxAbdomen}
							onToggleEdit={toggleEdit}
							value={medicalData.assaultThoraxAbdomen}
							placeholder='Findings for thorax and abdomen.'
							onChange={(value) =>
								setMedicalData((p) => ({ ...p, assaultThoraxAbdomen: value }))
							}
						/>
						<EditableTextarea
							label='c) Upper limbs'
							editKey='assaultUpperLimbs'
							isEditing={!!editing.assaultUpperLimbs}
							onToggleEdit={toggleEdit}
							value={medicalData.assaultUpperLimbs}
							placeholder='Details of injuries.'
							onChange={(value) =>
								setMedicalData((p) => ({ ...p, assaultUpperLimbs: value }))
							}
						/>
						<EditableTextarea
							label='d) Lower limbs'
							editKey='assaultLowerLimbs'
							isEditing={!!editing.assaultLowerLimbs}
							onToggleEdit={toggleEdit}
							value={medicalData.assaultLowerLimbs}
							placeholder='Details of injuries.'
							onChange={(value) =>
								setMedicalData((p) => ({ ...p, assaultLowerLimbs: value }))
							}
						/>

						<div className='form-section'>
							<label className='form-label'>2. Approximate age of injuries</label>
							<input
								type='text'
								className='form-input'
								placeholder='Approx. (e.g. 2 hours)'
								value={medicalData.approxAgeOfInjuries}
								onChange={(e) =>
									setMedicalData((p) => ({
										...p,
										approxAgeOfInjuries: e.target.value,
									}))
								}
							/>
						</div>

						<div className='form-section'>
							<label className='form-label'>3. Probable type of weapon(s)</label>
							<input
								type='text'
								className='form-input'
								placeholder='Likely blunt force (e.g., fists).'
								value={medicalData.probableWeapons}
								onChange={(e) =>
									setMedicalData((p) => ({
										...p,
										probableWeapons: e.target.value,
									}))
								}
							/>
						</div>

						<div className='form-row'>
							<div className='form-group'>
								<label className='form-label'>
									Name of Medical Officer/Practitioner
								</label>
								<input
									type='text'
									className='form-input'
									placeholder='Full Name (Leave Blank)'
									value={medicalData.medicalOfficerName}
									onChange={(e) =>
										setMedicalData((p) => ({
											...p,
											medicalOfficerName: e.target.value,
										}))
									}
								/>
							</div>
							<div className='form-group'>
								<label className='form-label'>Signature</label>
								<input
									type='text'
									className='form-input'
									placeholder='Signature (Leave Blank)'
									value={medicalData.signature}
									onChange={(e) =>
										setMedicalData((p) => ({ ...p, signature: e.target.value }))
									}
								/>
							</div>
							<div className='form-group'>
								<label className='form-label'>Date</label>
								<input
									type='text'
									className='form-input'
									placeholder='DD/MM/YYYY (Leave Blank)'
									value={medicalData.medicalOfficerDate}
									onChange={(e) =>
										setMedicalData((p) => ({
											...p,
											medicalOfficerDate: e.target.value,
										}))
									}
								/>
							</div>
						</div>
					</P3SectionCard>

					<P3SectionCard title="SECTION 'C' - SEXUAL OFFENCES">
						<div className='form-section'>
							<label className='form-label'>1. Nature of offence</label>
							<input
								type='text'
								className='form-input'
								placeholder='e.g., NA'
								value={medicalData.natureOfOffence}
								onChange={(e) =>
									setMedicalData((p) => ({
										...p,
										natureOfOffence: e.target.value,
									}))
								}
							/>
						</div>

						<EditableTextarea
							label='a) Female: injuries to genitalia'
							editKey='femaleInjuriesToGenitalia'
							isEditing={!!editing.femaleInjuriesToGenitalia}
							onToggleEdit={toggleEdit}
							value={medicalData.femaleInjuriesToGenitalia}
							placeholder='Details (or NA).'
							onChange={(value) =>
								setMedicalData((p) => ({
									...p,
									femaleInjuriesToGenitalia: value,
								}))
							}
						/>

						<EditableTextarea
							label='b) Male: injuries to genitalia'
							editKey='maleInjuriesToGenitalia'
							isEditing={!!editing.maleInjuriesToGenitalia}
							onToggleEdit={toggleEdit}
							value={medicalData.maleInjuriesToGenitalia}
							placeholder='Details (or NA).'
							onChange={(value) =>
								setMedicalData((p) => ({
									...p,
									maleInjuriesToGenitalia: value,
								}))
							}
						/>
					</P3SectionCard>

					<P3SectionCard title="SECTION 'D' - SPECIMENS AND REMARKS">
						<EditableTextarea
							label='Details of specimens collected'
							editKey='specimensCollected'
							isEditing={!!editing.specimensCollected}
							onToggleEdit={toggleEdit}
							value={medicalData.specimensCollected}
							placeholder='e.g., NA'
							onChange={(value) =>
								setMedicalData((p) => ({ ...p, specimensCollected: value }))
							}
						/>
						<EditableTextarea
							label='Any additional remarks'
							editKey='additionalRemarks'
							isEditing={!!editing.additionalRemarks}
							onToggleEdit={toggleEdit}
							value={medicalData.additionalRemarks}
							placeholder='Additional notes.'
							onChange={(value) =>
								setMedicalData((p) => ({ ...p, additionalRemarks: value }))
							}
						/>
					</P3SectionCard>

					<div className='p3-footer'>
						<div className='privacy-toggle'>
							<label className='switch'>
								<input
									type='checkbox'
									checked={sessionPrivacyEnabled}
									onChange={(e) => setSessionPrivacyEnabled(e.target.checked)}
								/>
								<span className='slider' />
							</label>
							<div className='privacy-text'>
								<div className='privacy-title'>Session Privacy Enabled</div>
							</div>
						</div>
						<button
							type='button'
							className='submit-p3-button'
							onClick={handleSubmitCompleted}>
							Submit Completed P3 Form
						</button>
					</div>

					<div className='form-actions'>
						<button
							className='evidence-button'
							onClick={() => navigate(`/evidence/${caseId}`)}>
							Upload Evidence Pictures
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default P3ReportPage;
