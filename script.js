document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    const authPage = document.getElementById('auth-page');
    const mainDashboard = document.getElementById('main-dashboard');
    const historyPage = document.getElementById('history-page');
    const savingsPage = document.getElementById('savings-page');
    const loansPage = document.getElementById('loans-page');
    const profilePage = document.getElementById('profile-page');
    const reportsPage = document.getElementById('reports-page');
    const bottomNav = document.querySelector('.bottom-nav');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginErrorMsg = document.getElementById('login-error-msg');
    const registerErrorMsg = document.getElementById('register-error-msg');
    const logoutButton = document.getElementById('logout-button');

    const userNameSpan = document.getElementById('user-name');
    const totalBalanceEl = document.getElementById('total-balance');
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpenseEl = document.getElementById('total-expense');
    
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const typeSelect = document.getElementById('type');
    const paymentMethodSelect = document.getElementById('payment-method');
    const addTransactionButton = document.getElementById('add-transaction-button');
    const transactionList = document.getElementById('transaction-list');
    const notificationBar = document.getElementById('notification-bar');
    const notificationMessage = document.getElementById('notification-message');

    const homeButton = document.getElementById('home-button');
    const profileButtonNav = document.querySelector('.bottom-nav #profile-button');
    const backToDashboardHistoryButton = document.getElementById('back-to-dashboard-history');
    const backToDashboardSavingsButton = document.getElementById('back-to-dashboard-savings');
    const backToDashboardLoansButton = document.getElementById('back-to-dashboard-loans');
    const backToDashboardProfileButton = document.getElementById('back-to-dashboard-profile');
    const backToDashboardReportsButton = document.getElementById('back-to-dashboard-reports');

    const historyOptionCard = document.getElementById('history-option-card');
    const savingsOptionCard = document.getElementById('savings-option-card');
    const loansOptionCard = document.getElementById('loans-option-card');
    const reportsOptionCard = document.getElementById('reports-option-card');

    const savingsGoalNameInput = document.getElementById('savings-goal-name');
    const savingsGoalAmountInput = document.getElementById('savings-goal-amount');
    const savingsCurrentAmountInput = document.getElementById('savings-current-amount');
    const addSavingsGoalButton = document.getElementById('add-savings-goal-button');
    const savingsGoalList = document.getElementById('savings-goal-list');

    const loanAmountInput = document.getElementById('loan-amount');
    const loanTermInput = document.getElementById('loan-term');
    const applyLoanButton = document.getElementById('apply-loan-button');
    const loansList = document.getElementById('loans-list');
    
    const financeChartCanvas = document.getElementById('finance-chart');
    const financeHealthInfo = document.getElementById('finance-health-info');
    let financeChart = null;

    let currentUser = null;
    let users = JSON.parse(localStorage.getItem('users')) || {};

    const showNotification = (message, type = 'success') => {
        notificationMessage.textContent = message;
        notificationBar.classList.add('show', type);
        setTimeout(() => {
            notificationBar.classList.remove('show', type);
        }, 3000);
    };

    const showPage = (pageToShow, navButtonId = '') => {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));

        pageToShow.classList.add('active');

        if (navButtonId) {
            const activeButton = document.getElementById(navButtonId);
            if (activeButton) activeButton.classList.add('active');
        }

        if (pageToShow === mainDashboard || pageToShow === profilePage) {
            bottomNav.style.display = 'flex';
        } else {
            bottomNav.style.display = 'none';
        }
    };

    const updateDashboard = () => {
        if (!currentUser) return;
        userNameSpan.textContent = currentUser.username;
        updateFinanceSummary();
        renderTransactionHistory();
        renderSavingsGoals();
        renderLoans();
    };

    const updateFinanceSummary = () => {
        let totalIncome = 0;
        let totalExpense = 0;
        currentUser.transactions.forEach(t => {
            if (t.type === 'income') {
                totalIncome += t.amount;
            } else {
                totalExpense += t.amount;
            }
        });
        const totalBalance = totalIncome - totalExpense;
        totalBalanceEl.textContent = `Rp${totalBalance.toLocaleString('id-ID')}`;
        totalIncomeEl.textContent = `Rp${totalIncome.toLocaleString('id-ID')}`;
        totalExpenseEl.textContent = `Rp${totalExpense.toLocaleString('id-ID')}`;
        localStorage.setItem('users', JSON.stringify(users));
    };

    const renderTransactionHistory = () => {
        transactionList.innerHTML = '';
        if (!currentUser || currentUser.transactions.length === 0) {
            transactionList.innerHTML = '<p class="bottom-info">Belum ada riwayat transaksi.</p>';
            return;
        }
        currentUser.transactions.forEach(t => {
            const item = document.createElement('div');
            item.classList.add('transaction-item');
            item.innerHTML = `
                <div class="transaction-info">
                    <h4>${t.description}</h4>
                    <p>${new Date(t.date).toLocaleDateString('id-ID')} | Metode: ${t.paymentMethod}</p>
                </div>
                <span class="transaction-amount-display ${t.type}">Rp${t.amount.toLocaleString('id-ID')}</span>
            `;
            transactionList.appendChild(item);
        });
    };

    const renderSavingsGoals = () => {
        savingsGoalList.innerHTML = '';
        if (!currentUser || !currentUser.savingsGoals || currentUser.savingsGoals.length === 0) {
            savingsGoalList.innerHTML = '<p class="bottom-info">Belum ada target tabungan.</p>';
            return;
        }
        currentUser.savingsGoals.forEach((goal, index) => {
            const item = document.createElement('div');
            item.classList.add('savings-goal-item');
            const progress = Math.min((goal.currentAmount / goal.goalAmount) * 100, 100);
            item.innerHTML = `
                <h4>${goal.name}</h4>
                <p>Terkumpul: Rp${goal.currentAmount.toLocaleString('id-ID')} dari Rp${goal.goalAmount.toLocaleString('id-ID')}</p>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progress}%;"></div>
                </div>
                <button class="delete-savings-goal" data-index="${index}">Hapus</button>
            `;
            savingsGoalList.appendChild(item);
        });
    };

    const renderLoans = () => {
        loansList.innerHTML = '';
        if (!currentUser || !currentUser.loans || currentUser.loans.length === 0) {
            loansList.innerHTML = '<p class="bottom-info">Belum ada pinjaman aktif.</p>';
            return;
        }
        currentUser.loans.forEach((loan, index) => {
            const item = document.createElement('div');
            item.classList.add('loan-item');
            const remainingLoan = loan.initialAmount - loan.paidAmount;
            const remainingTerm = loan.term - loan.paidInstallments;
            const isFullyPaid = remainingLoan <= 0;
            const repayButtonDisabled = isFullyPaid ? 'disabled' : '';

            item.innerHTML = `
                <div class="loan-info">
                    <h4>Pinjaman sebesar Rp${loan.initialAmount.toLocaleString('id-ID')}</h4>
                    <p>Sisa Pinjaman: Rp${remainingLoan.toLocaleString('id-ID')}</p>
                    <p>Tenor: ${loan.term} bulan | Sisa Angsuran: ${remainingTerm} bulan</p>
                </div>
                <div class="repayment-section">
                    <p>Angsuran Bulanan: <strong>Rp${loan.monthlyPayment.toLocaleString('id-ID')}</strong></p>
                    <button class="repay-button" data-index="${index}" ${repayButtonDisabled}>Bayar Angsuran</button>
                </div>
            `;
            loansList.appendChild(item);
        });
    };

    const getMonthlyData = () => {
        const monthlyData = {};
        const now = new Date();
        const startMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        
        for (let i = 0; i < 6; i++) {
            const date = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
            const monthYear = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
            monthlyData[monthYear] = {
                income: 0,
                expense: 0,
                loanBalance: 0
            };
        }

        currentUser.transactions.forEach(t => {
            const date = new Date(t.date);
            const monthYear = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
            if (monthlyData[monthYear]) {
                if (t.type === 'income') {
                    monthlyData[monthYear].income += t.amount;
                } else {
                    monthlyData[monthYear].expense += t.amount;
                }
            }
        });

        // Hitung sisa pinjaman kumulatif
        let currentLoanBalance = 0;
        const loanHistory = [];
        currentUser.loans.forEach(loan => {
            currentLoanBalance += loan.initialAmount;
            loanHistory.push({ type: 'disbursement', amount: loan.initialAmount, date: new Date() });
            let tempLoanBalance = loan.initialAmount;
            for (let i = 0; i < loan.paidInstallments; i++) {
                tempLoanBalance -= loan.monthlyPayment;
                loanHistory.push({ type: 'repayment', amount: loan.monthlyPayment, date: new Date() });
            }
        });

        const months = Object.keys(monthlyData);
        for (const month of months) {
            let monthLoanBalance = 0;
            currentUser.loans.forEach(loan => {
                let startLoanDate = new Date(); // Asumsi pinjaman baru saja
                let endLoanDate = new Date();
                
                // Ini adalah logika yang disederhanakan, pada aplikasi nyata butuh tanggal akurat
                monthLoanBalance += loan.initialAmount - loan.paidAmount;
            });
            monthlyData[month].loanBalance = monthLoanBalance;
        }

        return monthlyData;
    };
    
    const renderFinanceChart = () => {
        if (financeChart) {
            financeChart.destroy();
        }

        const monthlyData = getMonthlyData();
        const labels = Object.keys(monthlyData);
        const incomeData = Object.values(monthlyData).map(m => m.income);
        const expenseData = Object.values(monthlyData).map(m => m.expense);
        const loanData = Object.values(monthlyData).map(m => m.loanBalance);
        
        financeChart = new Chart(financeChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Pemasukan (Rp)',
                        data: incomeData,
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.2)',
                        fill: true,
                        tension: 0.3,
                        borderWidth: 2
                    },
                    {
                        label: 'Pengeluaran (Rp)',
                        data: expenseData,
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.2)',
                        fill: true,
                        tension: 0.3,
                        borderWidth: 2
                    },
                    {
                        label: 'Sisa Pinjaman (Rp)',
                        data: loanData,
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.2)',
                        fill: true,
                        tension: 0.3,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuad'
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return `Rp${(value / 1000).toLocaleString('id-ID')}rb`;
                            }
                        }
                    }
                }
            }
        });
    };
    
    const analyzeFinanceHealth = () => {
        let totalIncome = 0;
        let totalExpense = 0;
        let totalLoan = 0;

        currentUser.transactions.forEach(t => {
            if (t.type === 'income') totalIncome += t.amount;
            else totalExpense += t.amount;
        });
        
        currentUser.loans.forEach(loan => {
            totalLoan += loan.initialAmount;
        });

        const incomeToExpenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) : 1;
        const debtToIncomeRatio = totalIncome > 0 ? (totalLoan / totalIncome) : 1;
        
        let message = '';
        if (incomeToExpenseRatio > 0.8 || debtToIncomeRatio > 0.4) {
            message = 'Kesehatan keuangan Anda perlu diperhatikan. Pengeluaran dan/atau pinjaman Anda terlalu tinggi dibandingkan pemasukan. Coba kurangi pengeluaran yang tidak perlu dan kelola utang Anda dengan lebih baik.';
        } else if (incomeToExpenseRatio < 0.5) {
            message = 'Kesehatan keuangan Anda sangat baik! Anda memiliki banyak sisa dana setelah pengeluaran. Pertahankan kebiasaan ini atau pertimbangkan untuk berinvestasi.';
        } else {
            message = 'Kesehatan keuangan Anda cukup stabil. Anda memiliki keseimbangan yang baik antara pemasukan dan pengeluaran. Terus pantau agar tetap sehat secara finansial.';
        }
        financeHealthInfo.textContent = message;
    };


    // Event Listeners
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        if (users[username] && users[username].password === password) {
            currentUser = users[username];
            localStorage.setItem('currentUser', JSON.stringify({ username: currentUser.username }));
            updateDashboard();
            showPage(mainDashboard, 'home-button');
        } else {
            loginErrorMsg.textContent = 'Nama pengguna atau kata sandi salah!';
        }
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        const koperasiId = document.getElementById('koperasi-id').value;
        if (users[username]) {
            registerErrorMsg.textContent = 'Nama pengguna sudah terdaftar!';
        } else {
            users[username] = {
                username: username,
                password: password,
                koperasiId: koperasiId,
                transactions: [],
                savingsGoals: [],
                loans: []
            };
            localStorage.setItem('users', JSON.stringify(users));
            alert('Pendaftaran berhasil! Silakan Masuk.');
            loginTab.click();
            document.getElementById('reg-username').value = '';
            document.getElementById('reg-password').value = '';
            document.getElementById('koperasi-id').value = '';
        }
    });

    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        loginErrorMsg.textContent = '';
        registerErrorMsg.textContent = '';
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        loginErrorMsg.textContent = '';
        registerErrorMsg.textContent = '';
    });

    logoutButton.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('currentUser');
        showPage(authPage);
        loginTab.click();
    });

    addTransactionButton.addEventListener('click', () => {
        if (!currentUser) return;
        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const type = typeSelect.value;
        const paymentMethod = paymentMethodSelect.value;

        if (description && amount > 0) {
            const newTransaction = {
                description,
                amount,
                type,
                paymentMethod,
                date: new Date().toISOString()
            };
            currentUser.transactions.unshift(newTransaction);
            updateDashboard();
            descriptionInput.value = '';
            amountInput.value = '';
            
            showNotification(`Transaksi '${description}' berhasil ditambahkan!`, 'success');

        } else {
            showNotification('Mohon isi semua data transaksi dengan benar.', 'error');
        }
    });

    addSavingsGoalButton.addEventListener('click', () => {
        if (!currentUser) return;
        const name = savingsGoalNameInput.value;
        const goalAmount = parseFloat(savingsGoalAmountInput.value);
        const currentAmount = parseFloat(savingsCurrentAmountInput.value);
        if (name && !isNaN(goalAmount) && goalAmount > 0 && !isNaN(currentAmount) && currentAmount >= 0) {
            if (!currentUser.savingsGoals) {
                currentUser.savingsGoals = [];
            }
            currentUser.savingsGoals.push({
                name,
                goalAmount,
                currentAmount
            });
            localStorage.setItem('users', JSON.stringify(users));
            renderSavingsGoals();
            savingsGoalNameInput.value = '';
            savingsGoalAmountInput.value = '';
            savingsCurrentAmountInput.value = '';
            showNotification(`Target tabungan '${name}' berhasil ditambahkan!`, 'success');
        } else {
            showNotification('Mohon isi semua data target dengan benar.', 'error');
        }
    });

    savingsGoalList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-savings-goal')) {
            const index = e.target.dataset.index;
            currentUser.savingsGoals.splice(index, 1);
            localStorage.setItem('users', JSON.stringify(users));
            renderSavingsGoals();
            showNotification('Target tabungan berhasil dihapus!', 'success');
        }
    });

    applyLoanButton.addEventListener('click', () => {
        if (!currentUser) return;
        const loanAmount = parseFloat(loanAmountInput.value);
        const loanTerm = parseInt(loanTermInput.value);
        if (loanAmount > 0 && loanTerm > 0) {
            const interestRate = 0.01;
            const totalAmountToRepay = loanAmount + (loanAmount * interestRate * loanTerm);
            const monthlyPayment = totalAmountToRepay / loanTerm;

            if (!currentUser.loans) {
                currentUser.loans = [];
            }
            currentUser.loans.push({
                initialAmount: loanAmount,
                paidAmount: 0,
                term: loanTerm,
                paidInstallments: 0,
                monthlyPayment: monthlyPayment,
                date: new Date().toISOString()
            });

            currentUser.transactions.unshift({
                description: `Pencairan Pinjaman`,
                amount: loanAmount,
                type: 'income',
                date: new Date().toISOString()
            });

            localStorage.setItem('users', JSON.stringify(users));
            updateDashboard();
            loanAmountInput.value = '';
            loanTermInput.value = '';
            showNotification('Pengajuan pinjaman berhasil!', 'success');
        } else {
            showNotification('Jumlah pinjaman dan tenor harus lebih dari 0.', 'error');
        }
    });

    loansList.addEventListener('click', (e) => {
        if (e.target.classList.contains('repay-button')) {
            const index = e.target.dataset.index;
            const loan = currentUser.loans[index];
            
            if (loan.paidInstallments < loan.term) {
                const repaymentAmount = loan.monthlyPayment;
                currentUser.transactions.unshift({
                    description: `Angsuran Pinjaman`,
                    amount: repaymentAmount,
                    type: 'expense',
                    date: new Date().toISOString()
                });
                
                loan.paidAmount += repaymentAmount;
                loan.paidInstallments += 1;

                if (loan.paidInstallments >= loan.term) {
                    showNotification('Pinjaman Anda sudah lunas!', 'success');
                } else {
                    showNotification('Angsuran berhasil dibayar.', 'success');
                }

                localStorage.setItem('users', JSON.stringify(users));
                updateDashboard();
            }
        }
    });
    
    homeButton.addEventListener('click', () => showPage(mainDashboard, 'home-button'));
    profileButtonNav.addEventListener('click', () => {
        document.getElementById('profile-username').textContent = currentUser.username;
        document.getElementById('profile-koperasi-id').textContent = currentUser.koperasiId;
        showPage(profilePage, 'profile-button');
    });

    historyOptionCard.addEventListener('click', () => {
        renderTransactionHistory();
        showPage(historyPage);
    });
    
    savingsOptionCard.addEventListener('click', () => {
        renderSavingsGoals();
        showPage(savingsPage);
    });

    loansOptionCard.addEventListener('click', () => {
        renderLoans();
        showPage(loansPage);
    });

    reportsOptionCard.addEventListener('click', () => {
        renderFinanceChart();
        analyzeFinanceHealth();
        showPage(reportsPage);
    });

    backToDashboardHistoryButton.addEventListener('click', () => showPage(mainDashboard, 'home-button'));
    backToDashboardSavingsButton.addEventListener('click', () => showPage(mainDashboard, 'home-button'));
    backToDashboardLoansButton.addEventListener('click', () => showPage(mainDashboard, 'home-button'));
    backToDashboardProfileButton.addEventListener('click', () => showPage(mainDashboard, 'home-button'));
    backToDashboardReportsButton.addEventListener('click', () => showPage(mainDashboard, 'home-button'));

    if (localStorage.getItem('currentUser')) {
        const storedUser = JSON.parse(localStorage.getItem('currentUser'));
        if (users[storedUser.username]) {
            currentUser = users[storedUser.username];
            updateDashboard();
            showPage(mainDashboard, 'home-button');
        } else {
            showPage(authPage);
        }
    } else {
        showPage(authPage);
    }
});