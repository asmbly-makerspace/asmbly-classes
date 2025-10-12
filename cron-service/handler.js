import { main as dailyClassMaintenance } from './prisma/dailyClassMaintenance.js';
import { main as weeklyReportingMetrics } from './prisma/weeklyReportingMetrics.js';
import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";


export async function lambdaHandler(event) {
    try {
        console.log(event);
        const result = findKeyBFS(event, 'cronType');
        const cronType = result?.value;

        if (!cronType) {
            throw new Error('No cron type found');
        }

        const ssmParams = await getSSMParams();

        const config = {
            NEON_API_KEY: ssmParams['/neon/api_key'],
            NEON_API_USER: ssmParams['/neon/api_user'],
            GMAIL_USER: ssmParams['/gmail/user'],
            GMAIL_PASS: ssmParams['/gmail/password'],
            DATABASE_URL: ssmParams['/classes-db/dsn'],
        }

        if (cronType === 'hourlyClassMaintenance') {
            await dailyClassMaintenance(config);
        } else if (cronType === 'weeklyReportingMetrics') {
            await weeklyReportingMetrics(config);
        } else {
            throw new Error('Invalid cron type');
        }

        console.log(`Successfully ran ${cronType}`);
        return 'Success';
    } catch (error) {
        console.error(`Unexpected error: ${error.message}`);
        throw error;
    }
}

async function getSSMParams() {
    try {
        const ssm = new SSMClient();

        const input = { // GetParametersRequest
            Names: [ // ParameterNameList // required
            "/neon/api_key",
            "/neon/api_user",
            "/gmail/user",
            "/gmail/password",
            "/classes-db/dsn",
            ],
            WithDecryption: true,
        };
        const command = new GetParametersCommand(input);
        const response = await ssm.send(command);

        const params = response.Parameters.reduce((acc, param) => {
            acc[param.Name] = param.Value;
            return acc;
        }, {});

        return params;
    } catch (error) {
        console.error(`Failed to get SSM parameters: ${error.message}`);
        throw error;
    }
}

function findKeyBFS(jsonObj, targetKey) {
    if (typeof jsonObj !== 'object' || jsonObj === null) {
      return undefined; // Not an object or null, cannot search
    }
  
    const queue = [{ obj: jsonObj, path: [] }]; // Store object and its path
    const visited = new Set(); // To prevent infinite loops with circular references
  
    while (queue.length > 0) {
      const { obj, path } = queue.shift(); // Dequeue the current item
  
      // Prevent re-processing objects already visited
      if (visited.has(obj)) {
        continue;
      }
      visited.add(obj);
  
      // Check if the current object contains the target key
      if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (key === targetKey) {
              return { value: obj[key], path: [...path, key] }; // Key found, return value and path
            }
            // If the value is an object or array, enqueue it for later processing
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              queue.push({ obj: obj[key], path: [...path, key] });
            }
          }
        }
      }
    }
  
    return undefined; // Key not found
  }