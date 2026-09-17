/**
 * ============================================================
 * main.js — CarX Premium Used Car Dealership
 * Dependencies: jQuery, Bootstrap 5, Slick Carousel
 * ============================================================
 */

$(document).ready(function() {

    // ============================================================
    // 1. GLOBAL VARIABLES
    // ============================================================
    let allVehicles = []; // stores all vehicles from JSON
    let currentFiltered = []; // stores filtered results
    const VEHICLE_API = 'data/cars.json';

    // ============================================================
    // 2. LOAD VEHICLES FROM JSON
    // ============================================================
    function loadVehicles() {
        return $.ajax({
            url: VEHICLE_API,
            method: 'GET',
            dataType: 'json'
        });
    }

    // ============================================================
    // 3. RENDER VEHICLE CARDS (for slider and listing pages)
    // ============================================================
    function renderVehicleCards(vehicles, containerSelector, limit = 0) {
        const container = $(containerSelector);
        if (!container.length) return;

        let html = '';
        const items = limit > 0 ? vehicles.slice(0, limit) : vehicles;

        items.forEach(function(car) {
            const badgeHtml = car.badge ? `<span class="card-badge">${car.badge}</span>` : '';
            html += `
                <div class="vehicle-card">
                    <div class="card-img-wrap">
                        <img src="${car.image || 'images/cars/placeholder.jpg'}" alt="${car.make} ${car.model}" loading="lazy" />
                        ${badgeHtml}
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${car.make} ${car.model}</h5>
                        <div class="card-meta">
                            <span><i class="fas fa-calendar-alt"></i> ${car.year}</span>
                            <span><i class="fas fa-tachometer-alt"></i> ${car.mileage.toLocaleString()} miles</span>
                            <span><i class="fas fa-gas-pump"></i> ${car.fuel}</span>
                            <span><i class="fas fa-cog"></i> ${car.transmission}</span>
                        </div>
                        <div class="card-price">£${car.price.toLocaleString()}</div>
                        <p class="card-desc">${car.description || ''}</p>
                        <div class="card-actions">
                            <a href="car-details.html?id=${car.id}" class="btn btn-maroon btn-sm">VIEW DETAILS</a>
                            <a href="contact.html" class="btn btn-outline-dark btn-sm">ENQUIRE</a>
                        </div>
                    </div>
                </div>
            `;
        });

        container.html(html);
    }

    // ============================================================
    // 4. INITIALIZE SLICK SLIDERS
    // ============================================================
    function initSlickSliders() {
        // Latest Offers Slider
        if ($('#latestOffersSlider').length) {
            $('#latestOffersSlider').slick({
                infinite: true,
                slidesToShow: 4,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 4000,
                dots: false,
                arrows: false,
                responsive: [
                    { breakpoint: 1024, settings: { slidesToShow: 3 } },
                    { breakpoint: 768, settings: { slidesToShow: 2 } },
                    { breakpoint: 576, settings: { slidesToShow: 1 } }
                ]
            });
        }

        // Customer Reviews Slider
        if ($('#reviewsSlider').length) {
            $('#reviewsSlider').slick({
                infinite: true,
                slidesToShow: 3,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 5000,
                dots: false,
                arrows: false,
                responsive: [
                    { breakpoint: 1024, settings: { slidesToShow: 2 } },
                    { breakpoint: 768, settings: { slidesToShow: 1 } }
                ]
            });
        }
    }

    // ============================================================
    // 5. HERO SEARCH FORM
    // ============================================================
    function initHeroSearch() {
        $('#heroSearchForm').on('submit', function(e) {
            e.preventDefault();

            const make = $('#heroMake').val();
            const model = $('#heroModel').val();
            const maxPrice = $('#heroPrice').val();

            // Build query string for cars.html
            let params = [];
            if (make) params.push(`make=${encodeURIComponent(make)}`);
            if (model) params.push(`model=${encodeURIComponent(model)}`);
            if (maxPrice) params.push(`price=${encodeURIComponent(maxPrice)}`);

            const query = params.length ? '?' + params.join('&') : '';
            window.location.href = 'cars.html' + query;
        });

        // Dynamically populate model dropdown based on make selection
        $('#heroMake').on('change', function() {
            const selectedMake = $(this).val();
            const modelSelect = $('#heroModel');
            modelSelect.empty().append('<option value="">Any Model</option>');

            if (selectedMake && allVehicles.length) {
                const models = [...new Set(
                    allVehicles
                    .filter(car => car.make === selectedMake)
                    .map(car => car.model)
                )].sort();

                models.forEach(m => {
                    modelSelect.append(`<option value="${m}">${m}</option>`);
                });
            }
        });
    }

    // ============================================================
    // 6. BACK TO TOP BUTTON
    // ============================================================
    function initBackToTop() {
        const btn = $('#backToTop');
        $(window).on('scroll', function() {
            if ($(window).scrollTop() > 400) {
                btn.addClass('show');
            } else {
                btn.removeClass('show');
            }
        });
        btn.on('click', function() {
            $('html, body').animate({ scrollTop: 0 }, 600);
        });
    }

    // ============================================================
    // 7. WHATSAPP FLOATING BUTTON — mobile hover disabled via CSS
    //    (tooltip only shows on desktop due to CSS :hover)
    // ============================================================

    // ============================================================
    // 8. VEHICLE DETAIL PAGE (car-details.html)
    // ============================================================
    function loadVehicleDetail() {
        if (!$('#vehicleDetailContainer').length) return;

        const urlParams = new URLSearchParams(window.location.search);
        const id = parseInt(urlParams.get('id'));

        if (!id || !allVehicles.length) {
            $('#vehicleDetailContainer').html('<p class="text-center">Vehicle not found.</p>');
            return;
        }

        const vehicle = allVehicles.find(c => c.id === id);
        if (!vehicle) {
            $('#vehicleDetailContainer').html('<p class="text-center">Vehicle not found.</p>');
            return;
        }

        // Render detail view
        const html = `
            <div class="row g-4">
                <div class="col-lg-6">
                    <img src="${vehicle.image || 'images/cars/placeholder.jpg'}" alt="${vehicle.make} ${vehicle.model}" class="img-fluid rounded" />
                </div>
                <div class="col-lg-6">
                    <h1 class="display-5 fw-bold">${vehicle.make} ${vehicle.model}</h1>
                    <div class="display-6 text-maroon fw-bold mb-3">£${vehicle.price.toLocaleString()}</div>
                    <div class="row g-3 mb-4">
                        <div class="col-6"><i class="fas fa-calendar-alt text-maroon"></i> Year: ${vehicle.year}</div>
                        <div class="col-6"><i class="fas fa-tachometer-alt text-maroon"></i> ${vehicle.mileage.toLocaleString()} miles</div>
                        <div class="col-6"><i class="fas fa-gas-pump text-maroon"></i> ${vehicle.fuel}</div>
                        <div class="col-6"><i class="fas fa-cog text-maroon"></i> ${vehicle.transmission}</div>
                        <div class="col-6"><i class="fas fa-car text-maroon"></i> ${vehicle.bodyType || 'N/A'}</div>
                        <div class="col-6"><i class="fas fa-tag text-maroon"></i> ${vehicle.badge || 'Standard'}</div>
                    </div>
                    <p class="lead">${vehicle.description || ''}</p>
                    <div class="d-flex gap-3 flex-wrap">
                        <a href="contact.html" class="btn btn-maroon btn-lg"><i class="fas fa-paper-plane"></i> Enquire Now</a>
                        <a href="contact.html" class="btn btn-outline-dark btn-lg"><i class="fas fa-gbp-sign"></i> Finance Quote</a>
                    </div>
                </div>
            </div>
            <!-- Similar Vehicles -->
            <hr class="my-5" />
            <h3 class="text-center mb-4">Similar Vehicles</h3>
            <div class="row g-4" id="similarVehicles"></div>
        `;

        $('#vehicleDetailContainer').html(html);

        // Show similar vehicles (same make or body type)
        const similar = allVehicles.filter(c =>
            c.id !== vehicle.id && (c.make === vehicle.make || c.bodyType === vehicle.bodyType)
        ).slice(0, 3);

        let similarHtml = '';
        similar.forEach(car => {
            similarHtml += `
                <div class="col-lg-4 col-md-6">
                    <div class="vehicle-card">
                        <div class="card-img-wrap">
                            <img src="${car.image || 'images/cars/placeholder.jpg'}" alt="${car.make} ${car.model}" loading="lazy" />
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">${car.make} ${car.model}</h5>
                            <div class="card-price">£${car.price.toLocaleString()}</div>
                            <a href="car-details.html?id=${car.id}" class="btn btn-maroon btn-sm">View Details</a>
                        </div>
                    </div>
                </div>
            `;
        });
        $('#similarVehicles').html(similarHtml || '<p class="text-muted">No similar vehicles found.</p>');
    }

    // ============================================================
    // 9. INITIALIZATION ON PAGE LOAD
    // ============================================================
    function init() {
        // Load vehicles
        loadVehicles()
            .done(function(data) {
                allVehicles = data;
                currentFiltered = data;

                // Populate latest offers slider (max 8 vehicles)
                if ($('#latestOffersSlider').length) {
                    renderVehicleCards(data, '#latestOffersSlider', 8);
                    // Re-initialize Slick after rendering cards
                    $('#latestOffersSlider').slick('refresh');
                }

                // If on car-details page, load detail
                loadVehicleDetail();

                // Populate hero search model dropdown if make is preselected? We'll let user select.
                // But we can populate models if a make is already selected via URL params (not needed for hero)
            })
            .fail(function() {
                console.error('Failed to load vehicle data.');
                // Show fallback message
                $('#latestOffersSlider').html('<p class="text-center text-muted">Unable to load vehicles. Please try again later.</p>');
            });

        // Initialize Slick sliders
        initSlickSliders();

        // Hero search
        initHeroSearch();

        // Back to top
        initBackToTop();

        // Fade-up on scroll (optional)
        if ($('.fade-up').length) {
            $(window).on('scroll', function() {
                $('.fade-up').each(function() {
                    const el = $(this);
                    const top = el.offset().top - $(window).scrollTop();
                    if (top < window.innerHeight - 100) {
                        el.addClass('visible');
                    }
                });
            });
            // Trigger once on load
            $(window).trigger('scroll');
        }
    }

    // ============================================================
    // 10. RUN
    // ============================================================
    init();

    // Re-run detail loading if vehicles are loaded later (safety)
    $(document).ajaxComplete(function() {
        if ($('#vehicleDetailContainer').length && allVehicles.length) {
            loadVehicleDetail();
        }
    });

}); // end document ready