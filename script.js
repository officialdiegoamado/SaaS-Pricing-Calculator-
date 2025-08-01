// SaaS Pricing Calculator JavaScript

class PricingCalculator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.calculateOnLoad();
    }

    initializeElements() {
        // Input elements
        this.monthlyUsers = document.getElementById('monthly-users');
        this.conversionRate = document.getElementById('conversion-rate');
        this.churnRate = document.getElementById('churn-rate');
        this.customerAcquisitionCost = document.getElementById('customer-acquisition-cost');
        this.operationalCosts = document.getElementById('operational-costs');
        this.targetMargin = document.getElementById('target-margin');
        this.calculateBtn = document.getElementById('calculate-btn');

        // Result elements
        this.totalCustomers = document.getElementById('total-customers');
        this.recommendedPrice = document.getElementById('recommended-price');
        this.monthlyRevenue = document.getElementById('monthly-revenue');
        this.profit = document.getElementById('profit');
        this.basicPrice = document.getElementById('basic-price');
        this.proPrice = document.getElementById('pro-price');
        this.enterprisePrice = document.getElementById('enterprise-price');
        this.clv = document.getElementById('clv');
        this.paybackPeriod = document.getElementById('payback-period');
        this.revenuePerUser = document.getElementById('revenue-per-user');
        this.grossRevenue = document.getElementById('gross-revenue');
        this.acquisitionCosts = document.getElementById('acquisition-costs');
        this.operationalCostsDisplay = document.getElementById('operational-costs-display');
    }

    bindEvents() {
        this.calculateBtn.addEventListener('click', () => this.calculatePricing());
        
        // Auto-calculate on input changes
        const inputs = [
            this.monthlyUsers, this.conversionRate, this.churnRate,
            this.customerAcquisitionCost, this.operationalCosts, this.targetMargin
        ];
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(() => this.calculatePricing(), 500);
            });
        });
    }

    calculateOnLoad() {
        // Calculate with default values on page load
        setTimeout(() => this.calculatePricing(), 100);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(num);
    }

    calculatePricing() {
        try {
            // Get input values
            const monthlyUsers = parseFloat(this.monthlyUsers.value) || 0;
            const conversionRate = parseFloat(this.conversionRate.value) || 0;
            const churnRate = parseFloat(this.churnRate.value) || 0;
            const customerAcquisitionCost = parseFloat(this.customerAcquisitionCost.value) || 0;
            const operationalCosts = parseFloat(this.operationalCosts.value) || 0;
            const targetMargin = parseFloat(this.targetMargin.value) || 0;

            // Validate inputs
            if (monthlyUsers <= 0 || conversionRate <= 0 || churnRate <= 0) {
                this.showError('Please enter valid positive numbers for all fields.');
                return;
            }

            // Calculate key metrics
            const totalCustomers = Math.round(monthlyUsers * (conversionRate / 100));
            const monthlyChurnRate = churnRate / 100;
            const customerLifetimeMonths = 1 / monthlyChurnRate;
            const customerLifetimeValue = this.calculateCLV(totalCustomers, customerAcquisitionCost, operationalCosts, targetMargin, customerLifetimeMonths);
            
            // Calculate recommended pricing
            const recommendedPrice = this.calculateRecommendedPrice(customerLifetimeValue, customerLifetimeMonths);
            
            // Use fixed pricing tiers
            const basicPrice = 97;
            const proPrice = 297;
            const enterprisePrice = 497;
            
            // Calculate revenue and profit based on average price across tiers
            const averagePrice = (basicPrice + proPrice + enterprisePrice) / 3; // $297 average
            const monthlyRevenue = totalCustomers * averagePrice;
            const totalAcquisitionCosts = totalCustomers * customerAcquisitionCost;
            const grossProfit = monthlyRevenue - totalAcquisitionCosts - operationalCosts;
            const profitMargin = (grossProfit / monthlyRevenue) * 100;
            
            // Calculate payback period
            const paybackPeriod = customerAcquisitionCost / recommendedPrice;

            // Update UI with results
            this.updateResults({
                totalCustomers,
                recommendedPrice,
                monthlyRevenue,
                profit: grossProfit,
                basicPrice,
                proPrice,
                enterprisePrice,
                clv: customerLifetimeValue,
                paybackPeriod,
                revenuePerUser: recommendedPrice,
                grossRevenue: monthlyRevenue,
                acquisitionCosts: totalAcquisitionCosts,
                operationalCosts: operationalCosts
            });

            // Add success animation
            this.addSuccessAnimation();

        } catch (error) {
            console.error('Calculation error:', error);
            this.showError('An error occurred during calculation. Please check your inputs.');
        }
    }

    calculateCLV(totalCustomers, acquisitionCost, operationalCosts, targetMargin, customerLifetimeMonths) {
        // Simplified CLV calculation
        const totalCosts = (acquisitionCost * totalCustomers) + operationalCosts;
        const targetRevenue = totalCosts / (1 - (targetMargin / 100));
        return targetRevenue / totalCustomers;
    }

    calculateRecommendedPrice(clv, customerLifetimeMonths) {
        // Calculate monthly price based on CLV and customer lifetime
        const monthlyPrice = clv / customerLifetimeMonths;
        return Math.round(monthlyPrice);
    }

    updateResults(results) {
        // Update main results
        this.totalCustomers.textContent = this.formatNumber(results.totalCustomers);
        this.recommendedPrice.textContent = this.formatCurrency(results.recommendedPrice);
        this.monthlyRevenue.textContent = this.formatCurrency(results.monthlyRevenue);
        this.profit.textContent = this.formatCurrency(results.profit);

        // Update pricing tiers
        this.basicPrice.textContent = this.formatCurrency(results.basicPrice);
        this.proPrice.textContent = this.formatCurrency(results.proPrice);
        this.enterprisePrice.textContent = this.formatCurrency(results.enterprisePrice);

        // Update insights
        this.clv.textContent = this.formatCurrency(results.clv);
        this.paybackPeriod.textContent = `${results.paybackPeriod.toFixed(1)} months`;
        this.revenuePerUser.textContent = this.formatCurrency(results.revenuePerUser);
        this.grossRevenue.textContent = this.formatCurrency(results.grossRevenue);
        this.acquisitionCosts.textContent = this.formatCurrency(results.acquisitionCosts);
        this.operationalCostsDisplay.textContent = this.formatCurrency(results.operationalCosts);
    }

    addSuccessAnimation() {
        const resultCards = document.querySelectorAll('.result-card');
        resultCards.forEach(card => {
            card.classList.add('success');
            setTimeout(() => card.classList.remove('success'), 600);
        });
    }

    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f56565;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }
}

// Add CSS for error notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .error-notification button {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        margin-left: 10px;
    }
    
    .error-notification button:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(style);

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PricingCalculator();
});

// Add some helpful tooltips and validation
document.addEventListener('DOMContentLoaded', () => {
    // Add input validation
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            const value = parseFloat(input.value);
            if (value < 0) {
                input.value = 0;
            }
        });
    });

    // Add helpful hints
    const hints = {
        'monthly-users': 'Total number of users who visit your platform monthly',
        'conversion-rate': 'Percentage of visitors who become paying customers',
        'churn-rate': 'Percentage of customers who cancel their subscription monthly',
        'customer-acquisition-cost': 'Average cost to acquire one new customer',
        'operational-costs': 'Monthly costs for running your business (servers, staff, etc.)',
        'target-margin': 'Desired profit margin as a percentage of revenue'
    };

    Object.keys(hints).forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.title = hints[id];
        }
    });
}); 