$(document).ready(function () {
  // Move the TOC on the left side of the page with the user as the user scrolls down, so the TOC is always visible.
  // Only start moving the TOC once the user has scrolled past the nav. Stop moving it at the bottom of the content.
  const moveToCWithScrolling = function () {
    const sidebar = $(".js-scroll-with-user");

    const scrollPosition = $(window).scrollTop();
    const navBarHeight = $('.navbar-default').innerHeight();

    const contentHeight = $('.guides-section-white').innerHeight() + navBarHeight;
    const sidebarHeight = sidebar.height();
    const sidebarBottomPos = scrollPosition + sidebarHeight;

    // Only start moving the TOC once we're past the nav
    if (scrollPosition >= navBarHeight) {
      // Stop moving the TOC when we're at the bottom of the content
      if (sidebarBottomPos >= contentHeight) {
        sidebar.removeClass('fixed');
        sidebar.addClass('bottom');
      } else {
        sidebar.addClass('fixed');
        sidebar.removeClass('bottom');
      }
    } else {
      sidebar.removeClass('fixed');
      sidebar.removeClass('bottom');
    }
  };

  // Update window hash without causing a "jump." https://stackoverflow.com/a/14690177/483528
  const updateHash = function(hash) {
    if (history.pushState) {
      history.pushState(null, null, hash);
    } else {
      window.location.hash = hash;
    }
  };

  // Show a dot next to the part of the TOC where the user has scrolled to. We can't use bootstrap's built-in ScrollSpy
  // because with Bootstrap 3.3.7, it only works with a Bootstrap Nav, whereas our TOC is auto-generated and does not
  // use Bootstrap Nav classes/markup.
  const scrollSpy = function() {
    const content = $(".js-scroll-spy");
    const navSelector = content.data('scroll-spy-nav-selector');
    const nav = $(navSelector);

    if (nav.length !== 1) {
      throw new Error(`Expected one nav that matched selector '${navSelector}' but got ${nav.length}`);
    }

    const allNavLinks = nav.find('a');
    allNavLinks.removeClass('selected');

    // Only consider an item in view if it's visible in the top 20% of the screen
    const buffer = $(window).height() / 5;
    const scrollPosition = $(window).scrollTop();
    const contentHeadings = content.find('h2, h3');
    const visibleHeadings = contentHeadings.filter((index, el) => scrollPosition + buffer >= $(el).offset().top);

    if (visibleHeadings.length > 0) {
      const selectedHeading = visibleHeadings.last();
      const selectedHeadingId = selectedHeading.attr('id');

      if (!selectedHeadingId) {
        throw new Error(`Did not find 'id' attribute on selected heading: ${selectedHeading}`);
      }

      const hash = `#${selectedHeadingId}`;
      const selectedNavLink = nav.find(`a[href$='${hash}']`);
      if (selectedNavLink.length === 1) {
        updateHash(hash);
        selectedNavLink.addClass('selected');

        const allTopLevelNavListItems = nav.find('.sectlevel1 > li');

        const parentNavListItem = selectedNavLink.parents('.sectlevel2').parent();
        const topLevelNavListItem = selectedNavLink.parents('.sectlevel1');

        if (parentNavListItem.length === 1) {
          // If this is a nested nav item, expand its parent nav
          allTopLevelNavListItems.removeClass('expanded');
          parentNavListItem.addClass('expanded');
        } else if (topLevelNavListItem.length === 1) {
          // Otherwise, this is a top-level nav item, so expand it directly
          allTopLevelNavListItems.removeClass('expanded');
          selectedNavLink.parent().addClass('expanded');
        }
      }
    }
  };

  $(window).scroll(moveToCWithScrolling);
  $(moveToCWithScrolling);

  $(window).scroll(scrollSpy);
  $(scrollSpy);
});
