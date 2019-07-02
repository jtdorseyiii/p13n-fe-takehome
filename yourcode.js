/**
 * This class takes in a class name, and once initialized, it will record and report on the visibility status of
 * elements with the specified classname.
 */
class IsItVisibleYet {
  constructor(className) {
    this.className = className;
    // gather all elements of the specified class.
    this.elementCollection = Array.from(
      document.getElementsByClassName(this.className)
    );
    // map out the keys for easier iteration later.
    this.elementKeys = this.elementCollection.keys();
  }
  /**
   * gets the starting positions of all elements in the specified class;
   */
  determinePositions = () => {
    // use the iterator on the class to run through all the elements of this class... since we're not closing over
    // any values here, we can use this to run things a little faster.
    for (let id of this.elementKeys) {
      // the current element.
      const element = this.elementCollection[id];
      // determine the position of the element on the screen at this moment.
      const { top, bottom } = element.getBoundingClientRect();
      // mobile-only elements are not visible in the test scenario, so weed them out of the list.
      if (top + bottom > 0) {
        // set additional properties on the element that we'll use in determining what visibility state to report on
        // later when we scroll the page.
        element.top = top;
        element.bottom = bottom;
        element.collectionId = id;
        element.topVisible = false;
        element.middleVisible = false;
        element.bottomVisible = false;
      }
    }
  };
  /**
   * updates the visibility 'state' of the elements as their visibility changes from top to middle to bottom.
   */
  updateElemVisibilityState = (elem, context) => {
    switch (context) {
      case "top":
        console.log(
          `Column with id: ${elem.id} started to become visible on the page.`
        );
        elem.topVisible = true;
        break;
      case "middle":
        console.log(
          `Column with id: ${elem.id} is now more than 50% visible on the page.`
        );
        elem.middleVisible = true;
        break;
      case "bottom":
        console.log(
          `Column with id: ${elem.id} is now fully visible on the page.`
        );
        elem.bottomVisible = true;
        break;
      default:
        // fallthrough case.
        console.log(
          `no context defined for ${context} on this element ${elem}.`
        );
    }
  };
  /**
   * This is the handler function that will check the elements for visibility
   */
  checkVisible = scrollPos => {
    const viewportHeight = window.innerHeight;
    const currentPos = viewportHeight + scrollPos;
    // the iterator doesn't help much here, since we need closure over some values... hence the forEach...
    this.elementCollection.forEach(elem => {
      // if the element has not become visible at all... because if they are all true, then it has been shown!!
      if (!elem.topVisible || !elem.middleVisible || !elem.bottomVisible) {
        // if the difference of the element top and the current scroll position is 0 or less, the top of the element
        // should be visible in the viewport.
        if (elem.top - currentPos <= 0 && !elem.topVisible) {
          this.updateElemVisibilityState(elem, "top");
        }
        // if half the sum of the element top and bottom less the current scroll position is less than 0, the element
        // should be more than 50% viewable now.
        if (
          (elem.top + elem.bottom) / 2 - currentPos < 0 &&
          !elem.middleVisible
        ) {
          this.updateElemVisibilityState(elem, "middle");
        }
        // if the difference of the element bottom and the current scroll position is less than or equal to 0, then
        // the element should be fully viewable in the viewport.
        if (elem.bottom - currentPos <= 0 && !elem.bottomVisible) {
          this.updateElemVisibilityState(elem, "bottom");
        }
      }
    });
  };
  /**
   * used to start up the listener.
   */
  init = () => {
    // first, determine the initial positions...
    this.determinePositions();

    // then, set initial visibility states...
    this.checkVisible(0);

    // finally, start the scroll event listener.
    window.onscroll = evt =>
      this.checkVisible(evt.target.scrollingElement.scrollTop);
  };
}

// fire it up!
const watchDivs = new IsItVisibleYet("column");
watchDivs.init();
