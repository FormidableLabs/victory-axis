// TODO: Move to `victory-util`.
export const getRole = function (child) {
  if (child) {
    if (child.props && child.props["data-victory-role"]) {
      return child.props["data-victory-role"];
    }
    if (child.type && child.type.role) {
      return child.type.role;
    }
  }
};
