# Sites Release Recovery

## Deployment Fails Before Going Live

1. Keep the last live version untouched.
2. Inspect the terminal Sites error.
3. Confirm the saved version points to the intended commit.
4. Fix source or packaging issues in a new commit.
5. Rerun the complete checks.
6. Push, save a new matching version, deploy it, and verify.

Do not repeatedly deploy the same failed artifact without understanding the error.

## Deployment Reports Success but the Page Looks Old

1. Confirm the production URL from the deployment result.
2. Confirm the saved version's commit SHA.
3. Request the page directly and inspect returned HTML or assets.
4. Check whether only one route or asset is stale.
5. Distinguish propagation delay from a wrong saved version.
6. Recheck after a short bounded interval.

Do not call a timeout proof of failure or success.

## Public Regression

1. Identify the exact task commit.
2. Create a targeted revert commit.
3. Preserve later compatible work.
4. Run full checks.
5. Save and deploy a new Sites version for the revert commit.
6. Verify the public route.

Never rewrite `main` history.

## Missing Access

If GitHub or Sites access is unavailable:

- Keep the verified local work safe.
- State that it is not live.
- Tell the user which account connection or approval is needed.
- Resume from the saved source state after access is restored.

Never ask the user to paste credentials or one-time codes into chat.
