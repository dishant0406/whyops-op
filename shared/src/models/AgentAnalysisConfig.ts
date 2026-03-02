import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';

export interface AgentAnalysisConfigAttributes {
  id: string;
  userId: string;
  projectId: string;
  environmentId: string;
  agentId: string;
  enabled: boolean;
  cronExpr: string;
  timezone: string;
  lookbackDays: number;
  samplingConfig?: Record<string, any>;
  lastRunAt?: Date;
  nextRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface AgentAnalysisConfigCreationAttributes
  extends Optional<
    AgentAnalysisConfigAttributes,
    | 'id'
    | 'enabled'
    | 'cronExpr'
    | 'timezone'
    | 'lookbackDays'
    | 'samplingConfig'
    | 'lastRunAt'
    | 'nextRunAt'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class AgentAnalysisConfig
  extends Model<AgentAnalysisConfigAttributes, AgentAnalysisConfigCreationAttributes>
  implements AgentAnalysisConfigAttributes
{
  declare id: string;
  declare userId: string;
  declare projectId: string;
  declare environmentId: string;
  declare agentId: string;
  declare enabled: boolean;
  declare cronExpr: string;
  declare timezone: string;
  declare lookbackDays: number;
  declare samplingConfig?: Record<string, any>;
  declare lastRunAt?: Date;
  declare nextRunAt?: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
}

AgentAnalysisConfig.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'project_id',
      references: {
        model: 'projects',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    environmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'environment_id',
      references: {
        model: 'environments',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'agent_id',
      references: {
        model: 'agents',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    cronExpr: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '0 * * * *',
      field: 'cron_expr',
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'UTC',
    },
    lookbackDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 14,
      field: 'lookback_days',
      validate: {
        min: 1,
        max: 365,
      },
    },
    samplingConfig: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      field: 'sampling_config',
    },
    lastRunAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_run_at',
    },
    nextRunAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'next_run_at',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'agent_analysis_configs',
    indexes: [
      { unique: true, fields: ['agent_id'] },
      { fields: ['enabled', 'next_run_at'] },
      { fields: ['user_id', 'project_id', 'environment_id'] },
    ],
  }
);

export default AgentAnalysisConfig;
