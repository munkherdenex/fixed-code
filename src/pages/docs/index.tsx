import { FunctionComponent } from "react";
import { EuiMarkdownFormat, EuiText } from "@elastic/eui";
import DocsLayout from "../../layouts/docs";

const markdownContent = `
# Introduction

Using {{custom_fields}} inside email templates allows you to personalize your emails by dynamically inserting recipient-specific information. This guide will explain how to set up and utilize {{custom_fields}} in your email templates effectively.

# Step-by-Step Guide

## Step 1: Define Your Custom Fields

First, you need to define the custom fields you plan to use. Common custom fields might include {{first_name}}, {{last_name}}, {{company_name}}, {{email}}, {{cf_name}}, etc.

## Step 2: Populate Custom Field Data

Ensure that your contact list or database contains the relevant data for these custom fields. Each contact should have the necessary information filled in for each custom field you plan to use.

## Step 3: Insert Custom Fields into Your Template

In your email template, insert the custom fields where you want the personalized information to appear. For example:

\`\`\`
Dear {{first_name}},

We are excited to inform you about our new product launch at {{company_name}}. We believe it will be a great addition to your needs.

Best regards,
[Your Company Name]
\`\`\`

## Step 4: Test Your Email Template

Before sending out your email to your entire list, send a test email to ensure that the custom fields are populating correctly.

Select a contact from your list.
Send a test email to your own address or a test address.
Verify that the custom fields are replaced with the correct contact information.

## Step 5: Send Your Email

Once you have confirmed that the custom fields are working as expected, you can proceed to send your email campaign to your entire contact list. The email service will automatically replace the custom fields with the corresponding information from each contact.

# Best Practices
Ensure Data Accuracy: Make sure that the data in your contact list is up-to-date and accurate to avoid sending emails with incorrect information.
Fallback Values: Use fallback values to handle cases where a custom field might be empty. For example: {{first_name | "Valued Customer"}}.
Preview Before Sending: Always preview your emails before sending them out to a large list to catch any potential errors.

# Troubleshooting

Custom Fields Not Populating: If your custom fields are not being replaced, check that they are correctly defined and that there is no typo in the field name.
Empty Fields: If some recipients' emails show empty custom fields, ensure that all necessary data is filled in your contact list.
By following these steps, you can effectively use {{custom_fields}} to personalize your email templates, making your communications more engaging and relevant to your recipients.
`;

const Index: FunctionComponent = () => {
  return (
    <DocsLayout
      pageHeader={{
        pageTitle: "How to Use {{custom_fields}} Inside Email Templates",
      }}
    >
      <EuiMarkdownFormat>{markdownContent}</EuiMarkdownFormat>
    </DocsLayout>
  );
};

export default Index;
