import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CreateAuditLogsDto } from '../dto/create-auditLogs.dto';
import { Action } from '../enums/action.enums';
import { ApiProperty } from '@nestjs/swagger';

//export type AuditDocument = HydratedDocument<Audit>;

@Schema({
  timestamps: true,
})
export class AuditLogs extends Document {
  @ApiProperty({// Swagger: agrega este dato a la respuesta del endpoint
    description: 'Entity afected',
    example: 'UserController',
    required: true,
  })
  @Prop({
    required: true,
    index: true,
    trim: true,
  })
  entityAfected: string;

  @Prop({
    required: true,
    trim: true,
  })
  entityAfectedId: string; // ID del registro afectado

  @Prop({
    required: true,
    enum: Action,
    trim: true,
  })
  action: Action;

  @Prop({
    required: true,
    trim: true,
  })
  userIdAction: string; // Usuario que realizó la acción

  @Prop({
    type: Object,
  })
  beforeData?: CreateAuditLogsDto; // Datos previos (en caso de UPDATE)

  @Prop({
    type: Object,
  })
  afterData?: CreateAuditLogsDto; // Datos posteriores (en caso de CREATE o UPDATE)
}

export const AuditLogsSchema = SchemaFactory.createForClass(AuditLogs);
