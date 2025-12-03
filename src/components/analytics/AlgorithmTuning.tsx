import { useMemo } from "react";
import type { FC } from "react";
import type { RankingWeights } from "@/lib/ranking/devlink-ranking";

interface AlgorithmTuningProps {
  weights: RankingWeights;
}

const TuningGroup: FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="rounded-xl border border-[var(--color-accent)]/20 bg-gray-900/50 p-6 backdrop-blur-sm">
    <h4 className="text-sm font-semibold text-[var(--color-accent)]">{title}</h4>
    <dl className="mt-4 space-y-3">{children}</dl>
  </div>
);

const TuningItem: FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between text-sm">
    <dt className="text-gray-300">{label}</dt>
    <dd className="font-medium text-white">{value}</dd>
  </div>
);

export const AlgorithmTuning: FC<AlgorithmTuningProps> = ({ weights }) => {
  const nf2 = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );

  return (
    <section>
      <h3 className="text-base font-semibold text-white">
        Algorithm Tuning
      </h3>
      <p className="mt-1 text-sm text-gray-400">
        These are the current weights used in the ranking algorithm.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <TuningGroup title="Engagement">
          <TuningItem label="Like" value={weights.engagement.like} />
          <TuningItem label="Reply" value={weights.engagement.reply} />
          <TuningItem label="Repost" value={weights.engagement.repost} />
          <TuningItem label="Save" value={weights.engagement.save} />
        </TuningGroup>
        <TuningGroup title="Growth Boost">
          <TuningItem
            label="Follower Limit"
            value={weights.newDeveloper.followerThreshold}
          />
          <TuningItem
            label="Account Age Limit"
            value={`${weights.newDeveloper.accountAgeDaysThreshold} days`}
          />
          <TuningItem
            label="Max Boost"
            value={weights.newDeveloper.maxBoost}
          />
        </TuningGroup>
        <TuningGroup title="Time Decay">
          <TuningItem
            label="Fresh Half-Life"
            value={`${weights.timeDecay.freshHalfLifeHours}h`}
          />
          <TuningItem
            label="Evergreen Half-Life"
            value={`${weights.timeDecay.evergreenHalfLifeHours}h`}
          />
          <TuningItem
            label="Minimum Multiplier"
            value={`${nf2.format(weights.timeDecay.minimumMultiplier * 100)}%`}
          />
        </TuningGroup>
      </div>
    </section>
  );
};
