pragma solidity 0.4.25;
pragma experimental "ABIEncoderV2";

import "./lib/StaticCall.sol";


/// @title Conditional - A wrapper to verify if abstract conditions are true
/// @author Liam Horne - <liam@l4v.io>
/// @notice This contracts purpose is to make it easy for to define and verify the
/// resolution of an abstract blockchain condition. A condition may be represented as
/// a successful function call or as an equality check on a function calls return value.
contract Conditional {

  using StaticCall for address;

  struct Condition {
    address to;
    bytes4 selector;
    bytes parameters;
    bytes32 expectedValueHash;
    bool onlyCheckForSuccess;
  }

  /// @notice Checks if a Condition is satisfied.
  /// @param condition A `Condition` struct
  /// @return A boolean indicating whether or not the condition is satisfied
  function isSatisfied(Condition memory condition)
    public
    view
    returns (bool)
  {
    if (condition.onlyCheckForSuccess) {
      return assertNotFails(condition);
    } else {
      return assertReturnsExpectedResult(condition);
    }
  }

  /// @notice Checks if the defined function call in a Condition fails or not.
  /// @param condition A `Condition` struct
  /// @return A boolean indicating whether or not the function call passed or failed.
  function assertNotFails(Condition condition)
    private
    view
    returns (bool)
  {
    condition.to.staticcall_as_bytes(
      abi.encodePacked(
        condition.selector,
        condition.parameters
      )
    );
    return true; // TODO: Need better way of cheaply checking
  }

  /// @notice Verifies the expected return value of a Condition
  /// @param condition A `Condition` struct
  /// @return A boolean verifying if the function call returned the expected result
  function assertReturnsExpectedResult(Condition condition)
    private
    view
    returns (bool)
  {
    bytes memory ret = condition.to.staticcall_as_bytes(
      abi.encodePacked(
        condition.selector,
        condition.parameters
      )
    );
    return keccak256(ret) == condition.expectedValueHash;
  }

}
