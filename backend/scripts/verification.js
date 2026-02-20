import axios from 'axios';

const API_URL = 'http://127.0.0.1:4000';
let token = '';
let projectId = '';
let taskId = '';

async function runVerification() {
    try {
        console.log('--- Starting Verification ---');

        // 1. Register
        const email = `testuser_${Date.now()}@example.com`;
        const password = 'password123';
        console.log(`1. Registering user: ${email}`);
        try {
            await axios.post(`${API_URL}/signup`, { email, password });
            console.log('   ✅ Registration successful');
        } catch (e) {
            console.error('   ❌ Registration failed', e.response?.data || e.message);
            return;
        }

        // 2. Login
        console.log('2. Logging in...');
        try {
            const loginRes = await axios.post(`${API_URL}/login`, { email, password });
            token = loginRes.data.token;
            console.log('   ✅ Login successful, token received');
        } catch (e) {
            console.error('   ❌ Login failed', e.response?.data || e.message);
            return;
        }

        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        // 3. Create Project
        console.log('3. Creating Project...');
        try {
            const projectRes = await axios.post(`${API_URL}/projects`, {
                name: 'Verification Project',
                description: 'Created by verification script',
                status: 'ACTIVE'
            }, authHeaders);
            projectId = projectRes.data.data?.id || projectRes.data.id;
            console.log(`   ✅ Project created: ${projectId}`);
        } catch (e) {
            console.error('   ❌ Create Project failed', e.response?.data || e.message);
            return;
        }

        // 4. Get Project
        console.log('4. Fetching Project...');
        try {
            const getProjectRes = await axios.get(`${API_URL}/projects/${projectId}`, authHeaders);
            if (getProjectRes.data.id === projectId) {
                console.log('   ✅ Project fetched successfully');
            } else {
                console.log('   ❌ Project ID mismatch');
            }
        } catch (e) {
            console.error('   ❌ Get Project failed', e.response?.data || e.message);
        }

        // 5. Create Task
        console.log('5. Creating Task...');
        try {
            const taskRes = await axios.post(`${API_URL}/projects/${projectId}/tasks`, {
                title: 'Verify Backend',
                description: 'Ensure API works',
                status: 'TODO',
                priority: 'HIGH',
                assigneeId: null // Optional
            }, authHeaders);
            taskId = taskRes.data.id;
            console.log(`   ✅ Task created: ${taskId}`);
        } catch (e) {
            console.error('   ❌ Create Task failed', e.response?.data || e.message);
        }

        // 6. Get Tasks
        console.log('6. Fetching Tasks...');
        try {
            const tasksRes = await axios.get(`${API_URL}/projects/${projectId}/tasks`, authHeaders);
            if (tasksRes.data.length > 0) {
                console.log(`   ✅ Fetched ${tasksRes.data.length} tasks`);
            } else {
                console.log('   ❌ No tasks found');
            }
        } catch (e) {
            console.error('   ❌ Get Tasks failed', e.response?.data || e.message);
        }

        // 7. Create Goal
        console.log('7. Creating Goal...');
        try {
            await axios.post(`${API_URL}/projects/${projectId}/goals`, {
                title: 'Finish Verification',
                targetDate: new Date().toISOString()
            }, authHeaders);
            console.log('   ✅ Goal created');
        } catch (e) {
            console.error('   ❌ Create Goal failed', e.response?.data || e.message);
        }

        // 8. Create Decision
        console.log('8. Creating Decision...');
        try {
            await axios.post(`${API_URL}/projects/${projectId}/decisions`, {
                title: 'Use Axios for testing',
                reason: 'It is simple'
            }, authHeaders);
            console.log('   ✅ Decision created');
        } catch (e) {
            console.error('   ❌ Create Decision failed', e.response?.data || e.message);
        }

        // 9. Get Activity
        console.log('9. Fetching Activities...');
        try {
            const activityRes = await axios.get(`${API_URL}/projects/${projectId}/activities`, authHeaders);
            if (activityRes.data.length > 0) {
                console.log(`   ✅ Fetched ${activityRes.data.length} activities`);
            } else {
                console.log('   ❌ No activities found (Async logging might be slow/broken or not implemented for all actions)');
            }
        } catch (e) {
            console.error('   ❌ Get Activities failed', e.response?.data || e.message);
        }

        // 10. Get Members
        console.log('10. Fetching Members...');
        try {
            const membersRes = await axios.get(`${API_URL}/projects/${projectId}/members`, authHeaders);
            if (membersRes.data.length > 0) {
                console.log(`   ✅ Fetched ${membersRes.data.length} members`);
            } else {
                console.log('   ❌ No members found');
            }
        } catch (e) {
            console.error('   ❌ Get Members failed', e.response?.data || e.message);
        }


        console.log('--- Verification Complete ---');

    } catch (error) {
        console.error('Verification script error:', error);
    }
}

runVerification();
