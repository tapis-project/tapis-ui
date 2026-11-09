/**
 * The route renders the page directly.
 *
 * There used to be a _Layout wrapper here whose whole body was a div with
 * paddingTop and paddingRight of half a rem. That is a second page inset on
 * top of .right-pane's, and it is why the job detail sat lower and further in
 * than every page beside it — invisible to the page itself, which had already
 * been cleaned up.
 */
export { default } from './JobDetail';
export { default as JobsDetail } from './JobDetail';
