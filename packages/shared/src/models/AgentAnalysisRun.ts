import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';

export interface AgentAnalysisRunAttributes {
  id: string;
  configId?: string;
  userId: string;
  projectId: string;
  environmentId: string;
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  windowStart: Date;
  windowEnd: Date;
  traceCount: number;
  eventCount: number;
  summary?: Record<string, any>;
  error?: string;
  startedAt?: Date;
  finishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface AgentAnalysisRunCreationAttributes
  extends Optional<
    AgentAnalysisRunAttributes,
    | 'id'
    | 'configId'
    | 'status'
    | 'traceCount'
    | 'eventCount'
    | 'summary'
    | 'error'
    | 'startedAt'
    | 'finishedAt'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class AgentAnalysisRun
  extends Model<AgentAnalysisRunAttributes, AgentAnalysisRunCreationAttributes>
  implements AgentAnalysisRunAttributes
{
  declare id: string;
  declare configId?: string;
  declare userId: string;
  declare projectId: string;
  declare environmentId: string;
  declare agentId: string;
  declare status: 'pending' | 'running' | 'completed' | 'failed';
  declare windowStart: Date;
  declare windowEnd: Date;
  declare traceCount: number;
  declare eventCount: number;
  declare summary?: Record<string, any>;
  declare error?: string;
  declare startedAt?: Date;
  declare finishedAt?: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
}

AgentAnalysisRun.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    configId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'config_id',
      references: {
        model: 'agent_analysis_configs',
        key: 'id',
      },
      onDelete: 'SET NULL',
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
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
    },
    windowStart: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'window_start',
    },
    windowEnd: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'window_end',
    },
    traceCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'trace_count',
    },
    eventCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'event_count',
    },
    summary: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'started_at',
    },
    finishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'finished_at',
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
    tableName: 'agent_analysis_runs',
    indexes: [
      { fields: ['agent_id', 'created_at'] },
      { fields: ['status'] },
      { fields: ['config_id'] },
      { fields: ['window_start', 'window_end'] },
      { fields: ['user_id', 'project_id', 'environment_id'] },
    ],
  }
);

export default AgentAnalysisRun;
