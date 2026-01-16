import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Workflow } from '@/models/workflow';
import { enqueueWorkflowExecution } from '@/lib/workflow-executor';

interface RouteContext {
  params: Promise<{ customerId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { customerId } = await context.params;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const payload = await request.json();

    console.log('Received webhook for customer:', customerId, payload);

    await connectToDatabase();

    // Find active workflows for this customer
    const workflows = await Workflow.find({
      customerId,
      isActive: true,
    });

    if (workflows.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'No active workflows found for this customer',
          customerId
        }
      );
    }

    // Enqueue execution for each matching workflow
    const executionIds: string[] = [];
    for (const workflow of workflows) {
      const executionId = await enqueueWorkflowExecution(
        workflow._id.toString(),
        customerId,
        payload
      );
      executionIds.push(executionId);
    }

    return NextResponse.json({
      success: true,
      message: `Triggered ${executionIds.length} workflow(s)`,
      customerId,
      executionIds,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to verify the webhook is set up correctly
export async function GET(request: NextRequest, context: RouteContext) {
  const { customerId } = await context.params;

  return NextResponse.json({
    message: 'Webhook endpoint is active',
    customerId,
    endpoint: `/api/webhooks/${customerId}`,
  });
}
