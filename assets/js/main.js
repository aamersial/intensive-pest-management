/* Intensive Pest Management: navigation, scroll reveal, quote form.
   No dependencies. Progressive enhancement: every page works with JS off. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- nav */
  var nav = document.querySelector('.nav');
  var burger = document.querySelector('.nav__burger');
  var menu = document.querySelector('.menu');

  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (burger && menu) {
    var lastFocus = null;

    var setMenu = function (open) {
      menu.classList.toggle('is-open', open);
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('is-locked', open);
      if (open) {
        lastFocus = document.activeElement;
        /* Wait for the overlay to become visible before moving focus. */
        requestAnimationFrame(function () {
          var first = menu.querySelector('a');
          if (first) first.focus();
        });
      } else if (lastFocus) {
        lastFocus.focus();
      }
    };

    burger.addEventListener('click', function () {
      setMenu(!menu.classList.contains('is-open'));
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (!menu.classList.contains('is-open')) return;
      if (event.key === 'Escape') {
        setMenu(false);
        return;
      }
      if (event.key !== 'Tab') return;
      var items = menu.querySelectorAll('a, button');
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && menu.classList.contains('is-open')) setMenu(false);
    });
  }

  /* ------------------------------------------------------------- reveal */
  var revealables = document.querySelectorAll('.reveal');
  if (revealables.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
      );
      revealables.forEach(function (el) { observer.observe(el); });
    }
  }

  /* --------------------------------------------------------------- form */
  /* Set FORM_ENDPOINT to a form service URL (Formspree, Netlify, Basin...)
     to post submissions as JSON. While it is empty, the form hands the
     completed message to the visitor's mail client instead of losing it. */
  var FORM_ENDPOINT = '';

  var form = document.querySelector('[data-quote-form]');
  if (!form) return;

  /* Custom validation takes over once JS is available. */
  form.setAttribute('novalidate', '');

  var status = form.querySelector('.form__status');
  var submit = form.querySelector('[type="submit"]');

  var showStatus = function (state, message) {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
    status.classList.add('is-visible');
  };

  var clearStatus = function () {
    if (!status) return;
    status.textContent = '';
    status.classList.remove('is-visible');
    delete status.dataset.state;
  };

  var fieldError = function (input, message) {
    var field = input.closest('.field') || input.closest('.check');
    if (!field) return;
    var slot = field.querySelector('.field__error');
    if (message) {
      field.dataset.invalid = 'true';
      input.setAttribute('aria-invalid', 'true');
      if (slot) slot.textContent = message;
    } else {
      delete field.dataset.invalid;
      input.removeAttribute('aria-invalid');
      if (slot) slot.textContent = '';
    }
  };

  var validate = function (input) {
    if (input.type === 'hidden' || input.type === 'submit') return true;
    var value = (input.value || '').trim();

    if (input.type === 'checkbox') {
      if (input.required && !input.checked) {
        fieldError(input, 'Please confirm before sending.');
        return false;
      }
      fieldError(input, '');
      return true;
    }

    if (input.required && !value) {
      fieldError(input, 'This field is required.');
      return false;
    }
    if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      fieldError(input, 'Enter a valid email address.');
      return false;
    }
    if (input.type === 'tel' && value && value.replace(/\D/g, '').length < 10) {
      fieldError(input, 'Enter a phone number with at least 10 digits.');
      return false;
    }
    fieldError(input, '');
    return true;
  };

  var inputs = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'));

  inputs.forEach(function (input) {
    input.addEventListener('blur', function () { validate(input); });
    input.addEventListener('input', function () {
      var field = input.closest('.field') || input.closest('.check');
      if (field && field.dataset.invalid === 'true') validate(input);
    });
  });

  var data = function () {
    var out = {};
    inputs.forEach(function (input) {
      if (!input.name || input.type === 'hidden') return;
      out[input.name] = input.type === 'checkbox' ? (input.checked ? 'Yes' : 'No') : input.value.trim();
    });
    return out;
  };

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    clearStatus();

    var invalid = inputs.filter(function (input) { return !validate(input); });
    if (invalid.length) {
      invalid[0].focus();
      showStatus('error', 'Please correct the highlighted fields and send again.');
      return;
    }

    var values = data();

    /* Honeypot: a real person never fills this. Report success, send nothing. */
    if (values.company) {
      showStatus('ok', 'Thanks. Your request has been received.');
      form.reset();
      return;
    }

    if (FORM_ENDPOINT) {
      submit.disabled = true;
      submit.setAttribute('aria-busy', 'true');
      showStatus('ok', 'Sending your request...');

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(values)
      })
        .then(function (response) {
          if (!response.ok) throw new Error('Request failed');
          form.reset();
          showStatus('ok', 'Thanks. We have your request and will call you within one business day.');
        })
        .catch(function () {
          showStatus('error', 'That did not send. Please call (519) 555-0147 or email hello@intensivepest.ca.');
        })
        .finally(function () {
          submit.disabled = false;
          submit.removeAttribute('aria-busy');
        });
      return;
    }

    /* No endpoint configured yet: hand off to the visitor's mail client. */
    var lines = Object.keys(values)
      .filter(function (key) { return key !== 'company'; })
      .map(function (key) { return key.replace(/_/g, ' ') + ': ' + values[key]; });
    var subject = 'Inspection request: ' + (values.property_type || 'property');
    var href = 'mailto:hello@intensivepest.ca?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
    window.location.href = href;
    showStatus('ok', 'Your email app should open with the request filled in. Send it and we will reply within one business day.');
  });
})();
