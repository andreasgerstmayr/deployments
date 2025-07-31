package main

import (
	"context"
	"log"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

var (
	tracer = otel.Tracer("tracegen")
)

func main() {
	if err := run(); err != nil {
		log.Fatalln(err)
	}
}

func run() (err error) {
	ctx := context.Background()
	otelShutdown, err := setupOTelSDK(ctx)
	if err != nil {
		return
	}

	root()

	otelShutdown(ctx)
	return nil
}

func root() {
	ctx, span := tracer.Start(context.Background(), "root")
	defer span.End()

	inner(ctx)
}

func inner(rootCtx context.Context) {
	ctx, span := tracer.Start(rootCtx, "inner")
	defer span.End()

	queue1(rootCtx)
	queue2(rootCtx, ctx)
}

func queue1(rootCtx context.Context) {
	_, span := tracer.Start(context.Background(), "async-queue-task1")

	span.AddLink(trace.LinkFromContext(rootCtx, attribute.String("key1", "link-to-root")))
	span.AddEvent("some-event1", trace.WithAttributes(attribute.String("key1", "val1"), attribute.String("key2", "val2")))

	defer span.End()
}

func queue2(rootCtx context.Context, innerCtx context.Context) {
	_, span := tracer.Start(context.Background(), "async-queue-task2")

	span.AddLink(trace.LinkFromContext(rootCtx, attribute.String("key1", "link-to-root")))
	span.AddLink(trace.LinkFromContext(innerCtx, attribute.String("key1", "link-to-inner")))
	span.AddEvent("some-event1", trace.WithAttributes(attribute.String("key1", "val1"), attribute.String("key2", "val2")))
	time.Sleep(123 * time.Millisecond)
	span.AddEvent("some-event2", trace.WithAttributes(attribute.String("key1", "val1"), attribute.String("key2", "val2")))

	defer span.End()
}
