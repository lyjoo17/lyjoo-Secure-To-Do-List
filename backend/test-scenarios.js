const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Utility: Sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Utility: Logging
const logStep = (step) => console.log(`\n[STEP] ${step}`);
const logSuccess = (msg) => console.log(`  SUCCESS: ${msg}`);
const logError = (msg) => console.log(`  ERROR: ${msg}`);

async function runScenarios() {
  console.log('--- lyjoo-TodoList User Scenario Test Start ---\n');

  // --- Scenario 1: Chulsoo (Office Worker) ---
  console.log('==============================================');
  console.log('SCENARIO 1: Office Worker Chulsoo');
  console.log('==============================================');

  let chulsooToken = '';
  const chulsooEmail = `chulsoo_${Date.now()}@example.com`;
  const chulsooPassword = 'Password123!';

  // 1. Register and Login
  logStep('Chulsoo Register and Login');
  try {
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      email: chulsooEmail,
      password: chulsooPassword,
      username: 'Chulsoo',
    });
    chulsooToken = res.data.data.accessToken;
    logSuccess(`Register/Login successful (Token: ${chulsooToken.substring(0, 10)}...)`);
  } catch (error) {
    logError(`Register failed: ${error.response?.data?.message || error.message}`);
    return; // Stop if login fails
  }

  // 2. Check Today's Todos & Add Work Todos
  logStep('Check initial todo list');
  try {
    const res = await axios.get(`${BASE_URL}/todos`, {
      headers: { Authorization: `Bearer ${chulsooToken}` },
    });
    logSuccess(`Current todo count: ${res.data.data.length}`);
  } catch (error) {
    logError('Failed to fetch todos');
  }

  logStep('Add work todos (Meeting prep, Report writing)');
  let reportTodoId = null;
  try {
    await axios.post(`${BASE_URL}/todos`, {
      title: 'Prepare Monday Meeting',
      content: 'Print materials and reserve room',
      startDate: new Date().toISOString(),
      dueDate: new Date().toISOString(),
    }, { headers: { Authorization: `Bearer ${chulsooToken}` } });

    const resReport = await axios.post(`${BASE_URL}/todos`, {
      title: 'Write Weekly Report',
      content: 'Summarize this week performance',
      startDate: new Date().toISOString(),
      dueDate: new Date().toISOString(),
    }, { headers: { Authorization: `Bearer ${chulsooToken}` } });
    reportTodoId = resReport.data.data.todoId;

    logSuccess('Added 2 basic work todos');
  } catch (error) {
    logError(`Failed to add todos: ${error.response?.data?.message || error.message}`);
  }

  // 3. Add Urgent Task
  logStep('Add urgent task ("Submit Report to Manager")');
  let urgentTodoId = null;
  try {
    const res = await axios.post(`${BASE_URL}/todos`, {
      title: 'Submit Report to Manager',
      content: 'Due by 11 AM',
      startDate: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      priority: 'HIGH'
    }, { headers: { Authorization: `Bearer ${chulsooToken}` } });
    urgentTodoId = res.data.data.todoId;
    logSuccess('Added urgent todo');
  } catch (error) {
    logError('Failed to add urgent todo');
  }

  // 4. Complete Task
  logStep('Complete urgent task');
  try {
    await axios.put(`${BASE_URL}/todos/${urgentTodoId}`, {
      isCompleted: true
    }, { headers: { Authorization: `Bearer ${chulsooToken}` } });
    
    const res = await axios.get(`${BASE_URL}/todos/${urgentTodoId}`, {
        headers: { Authorization: `Bearer ${chulsooToken}` }
    });
    
    if (res.data.data.status === 'COMPLETED') {
        logSuccess('Todo marked as COMPLETED');
    } else {
        logError(`Todo status is ${res.data.data.status}`);
    }
  } catch (error) {
    logError(`Failed to complete todo: ${error.response?.data?.message}`);
  }

  // 5. Accidental Delete & Restore
  logStep('Accidental delete ("Write Weekly Report")');
  try {
    await axios.delete(`${BASE_URL}/todos/${reportTodoId}`, {
      headers: { Authorization: `Bearer ${chulsooToken}` }
    });
    logSuccess('Todo deleted (moved to trash)');
  } catch (error) {
    logError('Failed to delete todo');
  }

  logStep('Restore from trash');
  try {
    await axios.patch(`${BASE_URL}/todos/${reportTodoId}/restore`, {}, {
      headers: { Authorization: `Bearer ${chulsooToken}` }
    });
    logSuccess('Restore requested');

    // Verify
    const res = await axios.get(`${BASE_URL}/todos/${reportTodoId}`, {
        headers: { Authorization: `Bearer ${chulsooToken}` }
    });
    if (res.data.data.deletedAt === null) {
        logSuccess('Todo restored successfully');
    }
  } catch (error) {
    logError(`Restore failed: ${error.message}`);
  }

  // 6. Check Holidays
  logStep('Check Holidays');
  try {
    const res = await axios.get(`${BASE_URL}/holidays`, {
        headers: { Authorization: `Bearer ${chulsooToken}` }
    });
    logSuccess(`Fetched ${res.data.data.length} holidays`);
  } catch (error) {
    logError('Failed to fetch holidays');
  }


  // --- Scenario 2: Karina (College Student) ---
  console.log('\n==============================================');
  console.log('SCENARIO 2: College Student Karina');
  console.log('==============================================');

  let karinaToken = '';
  const karinaEmail = `karina_${Date.now()}@example.com`;
  
  logStep('Karina Register');
  try {
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      email: karinaEmail,
      password: 'Password123!',
      username: 'Karina',
    });
    karinaToken = res.data.data.accessToken;
    logSuccess('Register successful');
  } catch (error) {
    logError('Register failed');
  }

  // 1. Invalid Date Test
  logStep('Invalid Date Test (DueDate < StartDate)');
  try {
    await axios.post(`${BASE_URL}/todos`, {
      title: 'Invalid Task',
      startDate: '2025-12-01',
      dueDate: '2025-11-01',
    }, { headers: { Authorization: `Bearer ${karinaToken}` } });
    logError('FAILED: Should have been rejected but succeeded');
  } catch (error) {
    if (error.response?.status === 400) {
        logSuccess('Correctly rejected with 400 Bad Request');
    } else {
        logError(`Unexpected error: ${error.message}`);
    }
  }

  // 2. Missing Title Test
  logStep('Missing Title Test');
  try {
    await axios.post(`${BASE_URL}/todos`, {
      content: 'Task without title',
      startDate: new Date().toISOString(),
    }, { headers: { Authorization: `Bearer ${karinaToken}` } });
    logError('FAILED: Should have been rejected but succeeded');
  } catch (error) {
    if (error.response?.status === 400) {
        logSuccess('Correctly rejected with 400 Bad Request');
    } else {
        logError(`Unexpected error: ${error.message}`);
    }
  }

  console.log('\n--- All Scenarios Finished ---');
}

runScenarios();