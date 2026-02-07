// Main JavaScript for PUPPAKA

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      navToggle.classList.toggle('active');
    });
    
    // Close menu when clicking on a link
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
      });
    });
  }
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Intersection Observer for scroll animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe elements with animation
  const animatedElements = document.querySelectorAll('.post-card, .project-card, .section-header');
  animatedElements.forEach(el => observer.observe(el));
  
  // Gallery Lightbox (if exists)
  const galleryImages = document.querySelectorAll('.gallery-image');
  if (galleryImages.length > 0) {
    galleryImages.forEach(img => {
      img.addEventListener('click', () => {
        openLightbox(img.src, img.alt);
      });
    });
  }
  
  // Form validation enhancement
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      const requiredFields = form.querySelectorAll('[required]');
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('error');
        } else {
          field.classList.remove('error');
        }
      });
      
      if (!isValid) {
        e.preventDefault();
      }
    });
  });
  
  // Add ripple effect to buttons
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      
      this.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
  });
});

// Lightbox function
function openLightbox(src, alt) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox-overlay"></div>
    <div class="lightbox-content">
      <img src="${src}" alt="${alt}" class="lightbox-image">
      <button class="lightbox-close">&times;</button>
    </div>
  `;
  
  document.body.appendChild(lightbox);
  document.body.style.overflow = 'hidden';
  
  // Close on click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-overlay') || e.target.classList.contains('lightbox-close')) {
      closeLightbox(lightbox);
    }
  });
  
  // Close on escape
  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape') {
      closeLightbox(lightbox);
      document.removeEventListener('keydown', escapeHandler);
    }
  });
}

function closeLightbox(lightbox) {
  lightbox.classList.add('closing');
  setTimeout(() => {
    lightbox.remove();
    document.body.style.overflow = '';
  }, 300);
}